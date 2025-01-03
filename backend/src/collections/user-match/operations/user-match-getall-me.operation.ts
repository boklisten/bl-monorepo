import { BlCollectionName } from "@backend/collections/bl-collection";
import { itemSchema } from "@backend/collections/item/item.schema";
import { standMatchSchema } from "@backend/collections/stand-match/stand-match.schema";
import { uniqueItemSchema } from "@backend/collections/unique-item/unique-item.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { addDetailsToAllMatches } from "@backend/collections/user-match/operations/user-match-getall-me-operation-helper";
import { getAllUserMatchesForUser } from "@backend/collections/user-match/operations/user-match-operation-utils";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Item } from "@shared/item/item";
import { UserMatch } from "@shared/match/user-match";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class GetMyUserMatchesOperation implements Operation {
  private readonly _userDetailStorage: BlDocumentStorage<UserDetail>;
  private readonly _userMatchStorage: BlDocumentStorage<UserMatch>;
  private readonly _uniqueItemStorage: BlDocumentStorage<UniqueItem>;
  private readonly _itemStorage: BlDocumentStorage<Item>;

  constructor(
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    userMatchStorage?: BlDocumentStorage<UserMatch>,
    uniqueItemStorage?: BlDocumentStorage<UniqueItem>,
    itemStorage?: BlDocumentStorage<Item>,
  ) {
    this._userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
    this._userMatchStorage =
      userMatchStorage ??
      new BlDocumentStorage(BlCollectionName.UserMatches, standMatchSchema);
    this._uniqueItemStorage =
      uniqueItemStorage ??
      new BlDocumentStorage(BlCollectionName.UniqueItems, uniqueItemSchema);
    this._itemStorage =
      itemStorage ?? new BlDocumentStorage(BlCollectionName.Items, itemSchema);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const matches = await getAllUserMatchesForUser(
      blApiRequest.user?.details ?? "",
      this._userMatchStorage,
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
