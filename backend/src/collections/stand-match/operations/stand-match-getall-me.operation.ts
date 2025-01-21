import { mapItemIdsToItemDetails } from "@backend/collections/user-match/operations/user-match-getall-me-operation-helper.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { StandMatchWithDetails } from "@shared/match/match-dtos.js";
import { StandMatch } from "@shared/match/stand-match.js";
import { ObjectId } from "mongodb";

export class GetMyStandMatchesOperation implements Operation {
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
      (await BlStorage.Items.getMany(items)).map((item) => [item.id, item]),
    );
    return {
      ...standMatch,
      itemDetails: mapItemIdsToItemDetails(items, itemsMap),
    };
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const customer = blApiRequest.user?.details ?? "";
    const standMatches = (await BlStorage.StandMatches.aggregate([
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
