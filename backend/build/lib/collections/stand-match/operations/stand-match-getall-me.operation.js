import { mapItemIdsToItemDetails } from "@backend/lib/collections/user-match/operations/user-match-getall-me-operation-helper.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { ObjectId } from "mongodb";
export class GetMyStandMatchesOperation {
    async addDetailsToStandMatch(standMatch) {
        const items = Array.from(new Set([
            standMatch.expectedHandoffItems,
            standMatch.expectedPickupItems,
            standMatch.deliveredItems,
            standMatch.receivedItems,
        ].flat()));
        const itemsMap = new Map((await BlStorage.Items.getMany(items)).map((item) => [item.id, item]));
        return {
            ...standMatch,
            itemDetails: mapItemIdsToItemDetails(items, itemsMap),
        };
    }
    async run(blApiRequest) {
        const customer = blApiRequest.user?.details ?? "";
        const standMatches = (await BlStorage.StandMatches.aggregate([
            {
                $match: {
                    customer: new ObjectId(customer),
                },
            },
        ]));
        const standMatch = standMatches[0];
        if (!standMatch) {
            return new BlapiResponse([]);
        }
        const standMatchWithDetails = await this.addDetailsToStandMatch(standMatch);
        return new BlapiResponse([standMatchWithDetails]);
    }
}
