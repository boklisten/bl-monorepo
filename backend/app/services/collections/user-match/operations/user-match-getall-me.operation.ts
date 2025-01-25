import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { UserMatch } from "@shared/match/user-match.js";
import { ObjectId } from "mongodb";

import { addDetailsToUserMatches } from "#services/collections/user-match/operations/user-match-getall-me-operation-helper";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";

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
