import { ObjectId } from "mongodb";

import { mapItemIdsToItemDetails } from "#services/collections/user-match/operations/user-match-getall-me-operation-helper";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { StandMatchWithDetails } from "#shared/match/match-dtos";
import { StandMatch } from "#shared/match/stand-match";

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
