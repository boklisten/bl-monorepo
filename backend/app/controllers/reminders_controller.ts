import type { HttpContext } from "@adonisjs/core/http";
import moment from "moment-timezone";
import { ObjectId } from "mongodb";

import { PermissionService } from "#services/auth/permission.service";
import CollectionEndpointAuth from "#services/collection-endpoint/collection-endpoint-auth";
import { sendMailV2 } from "#services/messenger/email/email-service";
import { massSendSMS } from "#services/messenger/sms/sms-service";
import { BlStorage } from "#services/storage/bl-storage";
import { reminderValidator } from "#validators/reminder";

async function canAccess(ctx: HttpContext) {
  try {
    const accessToken = await CollectionEndpointAuth.authenticate(
      { permission: "admin" },
      ctx,
    );
    return !!(
      accessToken &&
      PermissionService.isPermissionEqualOrOver(
        accessToken?.["permission"],
        "admin",
      )
    );
  } catch {
    return false;
  }
}

interface ReminderCustomer {
  name: string;
  dob: Date;
  customerItems: {
    title: string;
    deadline: string;
    blid: string;
  }[];
  phone: string;
  email: string;
  guardian: { phone: string | undefined; email: string | undefined };
}

async function aggregateCustomersToRemind(
  customerItemType: "rent" | "partly-payment" | "loan",
  branchIDs: string[],
  deadlineISO: string,
) {
  return (await BlStorage.CustomerItems.aggregate([
    {
      $match: {
        returned: false,
        buyout: false,
        cancel: false,
        type: customerItemType,
        "handoutInfo.handoutById": {
          $in: branchIDs.map((branchID) => new ObjectId(branchID)),
        },
        deadline: {
          $gt: moment(deadlineISO).subtract(2, "days").toDate(),
          $lt: moment(deadlineISO).add(2, "days").toDate(),
        },
      },
    },
    {
      $lookup: {
        from: "items",
        localField: "item",
        foreignField: "_id",
        as: "item",
      },
    },
    {
      $unwind: {
        path: "$item",
      },
    },
    {
      $group: {
        _id: "$customer",
        customerItems: {
          $push: {
            blid: "$blid",
            title: "$item.title",
            deadline: "$deadline",
          },
        },
      },
    },
    {
      $lookup: {
        from: "userdetails",
        localField: "_id",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $unwind: {
        path: "$customer",
      },
    },
    {
      $project: {
        name: "$customer.name",
        phone: "$customer.phone",
        dob: "$customer.dob",
        email: "$customer.email",
        guardian: {
          phone: "$customer.guardian.phone",
          email: "$customer.guardian.email",
        },
        customerItems: 1,
      },
    },
  ])) as ReminderCustomer[];
}

async function sendReminderEmail(
  emailTemplateId: string,
  customers: ReminderCustomer[],
  target: "primary" | "guardian",
) {
  const filteredCustomers =
    target === "primary"
      ? customers
      : customers.filter(
          (customer) => (customer.guardian.email?.length ?? 0) > 0,
        );

  if (filteredCustomers.length === 0) {
    return { success: true };
  }
  const personalizations = filteredCustomers.map((customer) => ({
    to: target === "primary" ? customer.email : (customer.guardian.email ?? ""),
    dynamicTemplateData: {
      name: customer.name?.split(" ")?.[0] ?? "",
      items: customer.customerItems.map((customerItem) => ({
        ...customerItem,
        deadline: moment(customerItem.deadline)
          .add(1, "day") // fixme: we need to add one day to get the correct date due to a time zone issue
          .format("DD/MM/YYYY"),
      })),
    },
  }));

  // SendGrid allows a maximum of 1000 personalizations per request
  const batches: (typeof personalizations)[] = [];
  for (let i = 0; i < personalizations.length; i += 1000) {
    batches.push(personalizations.slice(i, i + 1000));
  }
  const results = await Promise.all(
    batches.map((batch) =>
      sendMailV2("info@boklisten.no", emailTemplateId ?? "", batch),
    ),
  );

  return { success: results.every((r) => r.success) };
}

export default class RemindersController {
  async countRecipients(ctx: HttpContext) {
    if (!(await canAccess(ctx))) {
      return ctx.response.unauthorized();
    }
    const { deadlineISO, customerItemType, branchIDs } =
      await ctx.request.validateUsing(reminderValidator);
    const customers = await aggregateCustomersToRemind(
      customerItemType,
      branchIDs,
      deadlineISO,
    );
    return ctx.response.ok({ recipientCount: customers.length });
  }

  async remind(ctx: HttpContext) {
    if (!(await canAccess(ctx))) {
      return ctx.response.unauthorized();
    }

    const {
      deadlineISO,
      customerItemType,
      branchIDs,
      emailTemplateId,
      smsText,
    } = await ctx.request.validateUsing(reminderValidator);

    const customers = await aggregateCustomersToRemind(
      customerItemType,
      branchIDs,
      deadlineISO,
    );

    if (emailTemplateId) {
      const { success: successPrimaryEmail } = await sendReminderEmail(
        emailTemplateId,
        customers,
        "primary",
      );
      if (!successPrimaryEmail) {
        return ctx.response.internalServerError();
      }

      if (customerItemType === "rent") {
        const { success: successGuardianEmail } = await sendReminderEmail(
          emailTemplateId,
          customers,
          "guardian",
        );
        if (!successGuardianEmail) {
          return ctx.response.internalServerError();
        }
      }
    }

    if (smsText) {
      await massSendSMS(
        customers.map((customer) => ({
          phone: customer.phone,
          message: smsText,
        })),
      );
      if (customerItemType === "rent") {
        await massSendSMS(
          customers
            .filter((customer) => (customer.guardian.phone?.length ?? 0) > 0)
            .map((customer) => ({
              phone: customer.guardian.phone ?? "",
              message: smsText,
            })),
        );
      }
    }

    return ctx.response.ok({ success: true });
  }
}
