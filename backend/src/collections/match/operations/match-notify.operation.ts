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

export interface MatchNotifySpec {
  target: "senders" | "receivers" | "stand-only" | "all";
  message: string;
}

export function verifyMatchNotifySpec(
  matchLockSpec: unknown,
): matchLockSpec is MatchNotifySpec {
  const m = matchLockSpec as Record<string, unknown> | null | undefined;
  return (
    !!m &&
    typeof m["target"] === "string" &&
    typeof m["message"] === "string" &&
    ["senders", "receivers", "stand-only", "all"].includes(m["target"])
  );
}

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
    const matchNotifySpec = blApiRequest.data;
    if (!verifyMatchNotifySpec(matchNotifySpec)) {
      throw new BlError(`Malformed MatchNotifySpec`).code(701);
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
    switch (matchNotifySpec.target) {
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
              `${matchNotifySpec.message} Logg inn med: ${customer.email} Mvh Boklisten.no`,
            ),
        ),
      ),
    );
  }
}
