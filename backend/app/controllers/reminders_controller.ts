import type { HttpContext } from "@adonisjs/core/http";
import moment from "moment-timezone";
import { ObjectId } from "mongodb";

import DispatchService from "#services/dispatch_service";
import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { reminderValidator } from "#validators/reminder";
import {
  assertSendGridTemplateId,
  SendGridTemplateId,
} from "#validators/send_grid_template_id_validator";

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
  return (await StorageService.CustomerItems.aggregate([
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
  emailTemplateId: SendGridTemplateId,
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
  return await DispatchService.sendUserProvidedEmailTemplate({
    maybeEmailTemplateId: emailTemplateId,
    recipients: filteredCustomers.map((customer) => ({
      to:
        target === "primary" ? customer.email : (customer.guardian.email ?? ""),
      dynamicTemplateData: {
        name: customer.name?.split(" ")?.[0] ?? "",
        items: customer.customerItems.map((customerItem) => ({
          ...customerItem,
          deadline: moment(customerItem.deadline)
            .add(1, "day") // fixme: we need to add one day to get the correct date due to a time zone issue
            .format("DD/MM/YYYY"),
        })),
      },
    })),
  });
}

export default class RemindersController {
  async countRecipients(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

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
    PermissionService.adminOrFail(ctx);

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
        assertSendGridTemplateId(emailTemplateId),
        customers,
        "primary",
      );
      if (!successPrimaryEmail) {
        return ctx.response.internalServerError();
      }

      if (customerItemType === "rent") {
        const { success: successGuardianEmail } = await sendReminderEmail(
          assertSendGridTemplateId(emailTemplateId),
          customers,
          "guardian",
        );
        if (!successGuardianEmail) {
          return ctx.response.internalServerError();
        }
      }
    }

    if (smsText) {
      await DispatchService.sendReminderSms(
        customers.map((customer) => customer.phone),
        smsText,
      );
      if (customerItemType === "rent") {
        await DispatchService.sendReminderSms(
          customers
            .filter((customer) => (customer.guardian.phone?.length ?? 0) > 0)
            .map((customer) => customer.guardian.phone ?? ""),
          smsText,
        );
      }
    }

    return ctx.response.ok({ success: true });
  }
}
