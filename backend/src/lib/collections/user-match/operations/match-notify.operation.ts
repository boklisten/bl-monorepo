import { sendMail } from "@backend/lib/messenger/email/email-service.js";
import { sendSMS } from "@backend/lib/messenger/sms/sms-service.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { z } from "zod";
import { fromError } from "zod-validation-error";

const MatchNotifySpec = z.object({
  target: z.enum(["user-matches", "stand-only", "all"]),
  message: z.string().nonempty(),
});

export class MatchNotifyOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = MatchNotifySpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }

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
    switch (parsedRequest.data.target) {
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
              `Hei, ${customer.name.split(" ")[0]}. ${parsedRequest.data.message} Mvh Boklisten`,
            );
            await sendMail(
              {
                userId: customer.id,
                fromEmail: "info@boklisten.no",
                toEmail: customer.email,
                subject: "Du skal snart overlevere bøker",
              },
              "d-b6d2e8bcf3bc4e6e9aef3f8eb49f1c64",
              {
                name: customer.name.split(" ")[0] ?? customer.name,
                username: customer.email,
              },
            );
          },
        ),
      ),
    );
  }
}
