import vine from "@vinejs/vine";

import { sendMail } from "#services/messenger/email/email_service";
import { EMAIL_TEMPLATES } from "#services/messenger/email/email_templates";
import { sendSMS } from "#services/messenger/sms/sms-service";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";

const matchNotifyValidator = vine.object({
  target: vine.enum(["user-matches", "stand-only", "all"]),
  message: vine.string().minLength(10),
});

export class MatchNotifyOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const { target, message } = await vine.validate({
      schema: matchNotifyValidator,
      data: blApiRequest.data,
    });

    const userMatches = await BlStorage.UserMatches.getAll();
    const standMatches = await BlStorage.StandMatches.getAll();
    if (userMatches.length === 0 && standMatches.length === 0) {
      throw new BlError("Could not find any matches!");
    }
    const userMatchCustomers = new Set<string>();
    for (const userMatch of userMatches) {
      userMatchCustomers.add(userMatch.customerA);
      userMatchCustomers.add(userMatch.customerB);
    }
    const standMatchCustomers = new Set<string>();
    for (const standMatch of standMatches) {
      standMatchCustomers.add(standMatch.customer);
    }
    const standMatchOnlyCustomers =
      standMatchCustomers.difference(userMatchCustomers);

    let targetCustomerIds: Set<string>;
    switch (target) {
      case "user-matches": {
        targetCustomerIds = userMatchCustomers;
        break;
      }
      case "stand-only": {
        targetCustomerIds = standMatchOnlyCustomers;
        break;
      }
      case "all":
      default: {
        targetCustomerIds = userMatchCustomers.union(standMatchCustomers);
        break;
      }
    }

    return new BlapiResponse(
      await Promise.allSettled(
        (await BlStorage.UserDetails.getMany([...targetCustomerIds])).map(
          async (customer) => {
            await sendSMS(
              customer.phone,
              `Hei, ${customer.name.split(" ")[0]}. ${message} Mvh Boklisten`,
            );
            // fixme: rewrite so that we only send one send mail request for all users, using personalizations
            await sendMail({
              template: EMAIL_TEMPLATES.matchNotify,
              recipients: [
                {
                  to: customer.email,
                  dynamicTemplateData: {
                    name: customer.name.split(" ")[0] ?? customer.name,
                    username: customer.email,
                  },
                },
              ],
            });
          },
        ),
      ),
    );
  }
}
