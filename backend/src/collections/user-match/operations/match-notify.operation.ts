import { StandMatchModel } from "@backend/collections/stand-match/stand-match.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { UserMatchModel } from "@backend/collections/user-match/user-match.model";
import { sendMail } from "@backend/messenger/email/email-service";
import { sendSMS } from "@backend/messenger/sms/sms-service";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { z } from "zod";
import { fromError } from "zod-validation-error";

const MatchNotifySpec = z.object({
  target: z.enum(["user-matches", "stand-only", "all"]),
  message: z.string().nonempty(),
});

export class MatchNotifyOperation implements Operation {
  private userMatchStorage = new BlStorage(UserMatchModel);
  private standMatchStorage = new BlStorage(StandMatchModel);
  private userDetailStorage = new BlStorage(UserDetailModel);

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = MatchNotifySpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }

    const userMatches = await this.userMatchStorage.getAll();
    const standMatches = await this.standMatchStorage.getAll();
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
        (await this.userDetailStorage.getMany([...targetCustomerIds])).map(
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
