import { BlCollectionName } from "@backend/collections/bl-collection";
import { standMatchSchema } from "@backend/collections/stand-match/stand-match.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { userMatchSchema } from "@backend/collections/user-match/user-match.schema";
import { sendMail } from "@backend/messenger/email/email-service";
import { sendSMS } from "@backend/messenger/sms/sms-service";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { StandMatch } from "@shared/match/stand-match";
import { UserMatch } from "@shared/match/user-match";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { z } from "zod";
import { fromError } from "zod-validation-error";

const MatchNotifySpec = z.object({
  target: z.enum(["user-matches", "stand-only", "all"]),
  message: z.string().nonempty(),
});

export class MatchNotifyOperation implements Operation {
  private readonly _userMatchStorage: BlDocumentStorage<UserMatch>;
  private readonly _standMatchStorage: BlDocumentStorage<StandMatch>;
  private readonly _userDetailStorage: BlDocumentStorage<UserDetail>;

  constructor(
    userMatchStorage?: BlDocumentStorage<UserMatch>,
    standMatchStorage?: BlDocumentStorage<StandMatch>,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
  ) {
    this._userMatchStorage =
      userMatchStorage ??
      new BlDocumentStorage(BlCollectionName.UserMatches, userMatchSchema);
    this._standMatchStorage =
      standMatchStorage ??
      new BlDocumentStorage(BlCollectionName.StandMatches, standMatchSchema);
    this._userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = MatchNotifySpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }

    const userMatches = await this._userMatchStorage.getAll();
    const standMatches = await this._standMatchStorage.getAll();
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
        (await this._userDetailStorage.getMany([...targetCustomerIds])).map(
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
