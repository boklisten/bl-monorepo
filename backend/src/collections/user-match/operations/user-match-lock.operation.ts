import { UserMatchModel } from "@backend/collections/user-match/user-match.model";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserMatch } from "@shared/match/user-match";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { fromError } from "zod-validation-error";

const MatchLockSpec = z.object({
  customerId: z.string(),
  userMatchesLocked: z.boolean(),
});

export class UserMatchLockOperation implements Operation {
  private userMatchStorage = new BlStorage(UserMatchModel);

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = MatchLockSpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }

    const userMatches = (await this.userMatchStorage.aggregate([
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

    const res = await this.userMatchStorage.updateMany(
      {
        _id: { $in: userMatches.map((match) => match.id) },
      },
      { itemsLockedToMatch: parsedRequest.data.userMatchesLocked },
    );

    return new BlapiResponse([res]);
  }
}
