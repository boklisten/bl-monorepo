import { BlCollectionName } from "@backend/collections/bl-collection";
import { itemSchema } from "@backend/collections/item/item.schema";
import { matchSchema } from "@backend/collections/match/match.schema";
import { addDetailsToAllMatches } from "@backend/collections/match/operations/match-getall-me-operation-helper";
import { getAllMatchesForUser } from "@backend/collections/match/operations/match-operation-utils";
import { uniqueItemSchema } from "@backend/collections/unique-item/unique-item.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Item } from "@shared/item/item";
import { Match } from "@shared/match/match";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class GetMyMatchesOperation implements Operation {
  private readonly _userDetailStorage: BlDocumentStorage<UserDetail>;
  private readonly _matchStorage: BlDocumentStorage<Match>;
  private readonly _uniqueItemStorage: BlDocumentStorage<UniqueItem>;
  private readonly _itemStorage: BlDocumentStorage<Item>;

  constructor(
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    matchStorage?: BlDocumentStorage<Match>,
    uniqueItemStorage?: BlDocumentStorage<UniqueItem>,
    itemStorage?: BlDocumentStorage<Item>,
  ) {
    this._userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
    this._matchStorage =
      matchStorage ??
      new BlDocumentStorage(BlCollectionName.Matches, matchSchema);
    this._uniqueItemStorage =
      uniqueItemStorage ??
      new BlDocumentStorage(BlCollectionName.UniqueItems, uniqueItemSchema);
    this._itemStorage =
      itemStorage ?? new BlDocumentStorage(BlCollectionName.Items, itemSchema);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const matches = await getAllMatchesForUser(
      blApiRequest.user?.details ?? "",
      this._matchStorage,
    );

    if (matches.length === 0) {
      return new BlapiResponse(matches);
    }

    const matchesWithDetails = await addDetailsToAllMatches(
      matches,
      this._userDetailStorage,
      this._itemStorage,
      this._uniqueItemStorage,
    );

    return new BlapiResponse(matchesWithDetails);
  }
}
