import { addDetailsToUserMatches } from "@backend/collections/user-match/operations/user-match-getall-me-operation-helper";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlStorage } from "@backend/storage/bl-storage";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserMatch } from "@shared/match/user-match";
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
