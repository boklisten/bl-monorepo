import { ItemModel } from "@backend/collections/item/item.model";
import { StandMatchModel } from "@backend/collections/stand-match/stand-match.model";
import { mapItemIdsToItemDetails } from "@backend/collections/user-match/operations/user-match-getall-me-operation-helper";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlStorage } from "@backend/storage/blStorage";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { StandMatchWithDetails } from "@shared/match/match-dtos";
import { StandMatch } from "@shared/match/stand-match";
import { ObjectId } from "mongodb";

export class GetMyStandMatchesOperation implements Operation {
  private standMatchStorage = new BlStorage(StandMatchModel);
  private itemStorage = new BlStorage(ItemModel);

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
      (await this.itemStorage.getMany(items)).map((item) => [item.id, item]),
    );
    return {
      ...standMatch,
      itemDetails: mapItemIdsToItemDetails(items, itemsMap),
    };
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const customer = blApiRequest.user?.details ?? "";
    const standMatches = (await this.standMatchStorage.aggregate([
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
