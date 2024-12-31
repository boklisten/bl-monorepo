import { BlCollectionName } from "@backend/collections/bl-collection";
import { difference } from "@backend/collections/match/helpers/set-methods";
import { matchSchema } from "@backend/collections/match/match.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { sendSMS } from "@backend/messenger/sms/sms-service";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Match, MatchVariant } from "@shared/match/match";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { z } from "zod";
import { fromError } from "zod-validation-error";

const MatchNotifySpec = z.object({
  target: z.enum(["senders", "receivers", "stand-only", "all"]),
  message: z.string().nonempty(),
});

export class MatchNotifyOperation implements Operation {
  private readonly _matchStorage: BlDocumentStorage<Match>;
  private readonly _userDetailStorage: BlDocumentStorage<UserDetail>;

  constructor(
    matchStorage?: BlDocumentStorage<Match>,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
  ) {
    this._matchStorage =
      matchStorage ??
      new BlDocumentStorage(BlCollectionName.Matches, matchSchema);
    this._userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = MatchNotifySpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }

    const matches = await this._matchStorage.getAll();
    if (matches.length === 0) {
      throw new BlError("Could not find any matches!");
    }
    const userMatches = matches.filter(
      (m) => m._variant === MatchVariant.UserMatch,
    );
    const senderCustomerIds = new Set(userMatches.map((m) => m.sender));
    const receiverCustomerIds = new Set(userMatches.map((m) => m.receiver));
    const standOnlyCustomerIds = difference(
      difference(
        new Set(
          matches
            .filter((m) => m._variant === MatchVariant.StandMatch)
            .map((m) => m.customer),
        ),
        senderCustomerIds,
      ),
      receiverCustomerIds,
    );

    let targetCustomerIds: Set<string>;
    switch (parsedRequest.data.target) {
      case "senders": {
        targetCustomerIds = senderCustomerIds;
        break;
      }
      case "receivers": {
        targetCustomerIds = receiverCustomerIds;
        break;
      }
      case "stand-only": {
        targetCustomerIds = standOnlyCustomerIds;
        break;
      }
      case "all":
      default: {
        targetCustomerIds = new Set([
          ...senderCustomerIds,
          ...receiverCustomerIds,
          ...standOnlyCustomerIds,
        ]);
        break;
      }
    }

    return new BlapiResponse(
      await Promise.allSettled(
        (await this._userDetailStorage.getMany([...targetCustomerIds])).map(
          (customer) =>
            sendSMS(
              customer.phone,
              `${parsedRequest.data.message} Logg inn med: ${customer.email} Mvh Boklisten.no`,
            ),
        ),
      ),
    );
  }
}
