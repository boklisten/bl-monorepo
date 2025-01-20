import { addDetailsToUserMatches } from "@backend/collections/user-match/operations/user-match-getall-me-operation-helper.js";
import { Operation } from "@backend/operation/operation.js";
import { BlApiRequest } from "@backend/request/bl-api-request.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { UserMatch } from "@shared/match/user-match.js";
import { ObjectId } from "mongodb";

export class GetMyUserMatchesOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
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
    ])) as UserMatch[];

    if (userMatches.length === 0) {
      return new BlapiResponse([]);
    }

    const matchesWithDetails = await addDetailsToUserMatches(userMatches);

    return new BlapiResponse(matchesWithDetails);
  }
}
