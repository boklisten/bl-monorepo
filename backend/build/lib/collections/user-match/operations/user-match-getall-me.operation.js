import { addDetailsToUserMatches } from "@backend/lib/collections/user-match/operations/user-match-getall-me-operation-helper.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { ObjectId } from "mongodb";
export class GetMyUserMatchesOperation {
    async run(blApiRequest) {
        const customer = blApiRequest.user?.details ?? "";
        const userMatches = (await BlStorage.UserMatches.aggregate([
            {
                $match: {
                    $or: [
                        { customerA: new ObjectId(customer) },
                        { customerB: new ObjectId(customer) },
                    ],
                },
            },
        ]));
        if (userMatches.length === 0) {
            return new BlapiResponse([]);
        }
        const matchesWithDetails = await addDetailsToUserMatches(userMatches);
        return new BlapiResponse(matchesWithDetails);
    }
}
