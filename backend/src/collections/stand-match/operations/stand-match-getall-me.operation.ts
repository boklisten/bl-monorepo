import { ItemModel } from "@backend/collections/item/item.model";
import { StandMatchModel } from "@backend/collections/stand-match/stand-match.model";
import { UniqueItemModel } from "@backend/collections/unique-item/unique-item.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { mapItemIdsToItemDetails } from "@backend/collections/user-match/operations/user-match-getall-me-operation-helper";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Item } from "@shared/item/item";
import { StandMatchWithDetails } from "@shared/match/match-dtos";
import { StandMatch } from "@shared/match/stand-match";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { ObjectId } from "mongodb";

export class GetMyStandMatchesOperation implements Operation {
  private readonly _userDetailStorage: BlDocumentStorage<UserDetail>;
  private readonly _standMatchStorage: BlDocumentStorage<StandMatch>;
  private readonly _uniqueItemStorage: BlDocumentStorage<UniqueItem>;
  private readonly _itemStorage: BlDocumentStorage<Item>;

  constructor(
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    standMatchStorage?: BlDocumentStorage<StandMatch>,
    uniqueItemStorage?: BlDocumentStorage<UniqueItem>,
    itemStorage?: BlDocumentStorage<Item>,
  ) {
    this._userDetailStorage =
      userDetailStorage ?? new BlDocumentStorage(UserDetailModel);
    this._standMatchStorage =
      standMatchStorage ?? new BlDocumentStorage(StandMatchModel);
    this._uniqueItemStorage =
      uniqueItemStorage ?? new BlDocumentStorage(UniqueItemModel);
    this._itemStorage = itemStorage ?? new BlDocumentStorage(ItemModel);
  }

  private async addDetailsToStandMatch(
    standMatch: StandMatch,
  ): Promise<StandMatchWithDetails> {
    const items = Array.from(
      new Set(
        [
          standMatch.expectedHandoffItems,
          standMatch.expectedPickupItems,
          standMatch.deliveredItems,
          standMatch.receivedItems,
        ].flat(),
      ),
    );

    const itemsMap = new Map(
      (await this._itemStorage.getMany(items)).map((item) => [item.id, item]),
    );
    return {
      ...standMatch,
      itemDetails: mapItemIdsToItemDetails(items, itemsMap),
    };
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const customer = blApiRequest.user?.details ?? "";
    const standMatches = (await this._standMatchStorage.aggregate([
      {
        $match: {
          customer: new ObjectId(customer),
        },
      },
    ])) as StandMatch[];

    const standMatch = standMatches[0];
    if (!standMatch) {
      return new BlapiResponse([]);
    }
    const standMatchWithDetails = await this.addDetailsToStandMatch(standMatch);

    return new BlapiResponse([standMatchWithDetails]);
  }
}
