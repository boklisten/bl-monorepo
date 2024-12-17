import {
  BlapiResponse,
  BlError,
  Match,
  MatchVariant,
} from "@boklisten/bl-model";
import { ObjectId } from "mongodb";

import { BlCollectionName } from "@/collections/bl-collection";
import { matchSchema } from "@/collections/match/match.schema";
import { getAllMatchesForUser } from "@/collections/match/operations/match-operation-utils";
import { isBoolean } from "@/helper/typescript-helpers";
import { Operation } from "@/operation/operation";
import { BlApiRequest } from "@/request/bl-api-request";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export interface MatchLockSpec {
  customerId: string;
  userMatchesLocked: boolean;
}

export function verifyMatchLockSpec(
  matchLockSpec: unknown,
): matchLockSpec is MatchLockSpec {
  const m = matchLockSpec as Record<string, unknown> | null | undefined;
  return (
    !!m &&
    typeof m["customerId"] === "string" &&
    ObjectId.isValid(m["customerId"]) &&
    isBoolean(m["userMatchesLocked"])
  );
}

export class MatchLockOperation implements Operation {
  private readonly _matchStorage: BlDocumentStorage<Match>;
  constructor(matchStorage?: BlDocumentStorage<Match>) {
    this._matchStorage =
      matchStorage ??
      new BlDocumentStorage(BlCollectionName.Matches, matchSchema);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const matchLockSpec = blApiRequest.data;
    if (!verifyMatchLockSpec(matchLockSpec)) {
      throw new BlError(`Malformed MatchLockSpec`).code(701);
    }
    const userMatches = (
      await getAllMatchesForUser(matchLockSpec.customerId, this._matchStorage)
    ).filter((match) => match._variant === MatchVariant.UserMatch);

    const res = await this._matchStorage.updateMany(
      {
        _id: { $in: userMatches.map((match) => match.id) },
      },
      { itemsLockedToMatch: matchLockSpec.userMatchesLocked },
    );

    return new BlapiResponse([res]);
  }
}
