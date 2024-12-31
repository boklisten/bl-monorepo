import { BlCollectionName } from "@backend/collections/bl-collection";
import { matchSchema } from "@backend/collections/match/match.schema";
import { getAllMatchesForUser } from "@backend/collections/match/operations/match-operation-utils";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Match, MatchVariant } from "@shared/match/match";
import { z } from "zod";
import { fromError } from "zod-validation-error";

const MatchLockSpec = z.object({
  customerId: z.string(),
  userMatchesLocked: z.boolean(),
});

export class MatchLockOperation implements Operation {
  private readonly _matchStorage: BlDocumentStorage<Match>;
  constructor(matchStorage?: BlDocumentStorage<Match>) {
    this._matchStorage =
      matchStorage ??
      new BlDocumentStorage(BlCollectionName.Matches, matchSchema);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = MatchLockSpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }

    const userMatches = (
      await getAllMatchesForUser(
        parsedRequest.data.customerId,
        this._matchStorage,
      )
    ).filter((match) => match._variant === MatchVariant.UserMatch);

    const res = await this._matchStorage.updateMany(
      {
        _id: { $in: userMatches.map((match) => match.id) },
      },
      { itemsLockedToMatch: parsedRequest.data.userMatchesLocked },
    );

    return new BlapiResponse([res]);
  }
}
