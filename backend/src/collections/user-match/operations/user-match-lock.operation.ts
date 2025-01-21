import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { UserMatch } from "@shared/match/user-match.js";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { fromError } from "zod-validation-error";

const MatchLockSpec = z.object({
  customerId: z.string(),
  userMatchesLocked: z.boolean(),
});

export class UserMatchLockOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = MatchLockSpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }

    const userMatches = (await BlStorage.UserMatches.aggregate([
      {
        $match: {
          $or: [
            { customerA: new ObjectId(parsedRequest.data.customerId) },
            { customerB: new ObjectId(parsedRequest.data.customerId) },
          ],
        },
      },
    ])) as UserMatch[];

    if (userMatches.length === 0) {
      throw new BlError("User does not have any user matches");
    }

    const res = await BlStorage.UserMatches.updateMany(
      {
        _id: { $in: userMatches.map((match) => match.id) },
      },
      { itemsLockedToMatch: parsedRequest.data.userMatchesLocked },
    );

    return new BlapiResponse([res]);
  }
}
