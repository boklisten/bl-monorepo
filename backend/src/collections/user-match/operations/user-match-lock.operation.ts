import { BlCollectionName } from "@backend/collections/bl-collection";
import { userMatchSchema } from "@backend/collections/user-match/user-match.schema";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
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
  private readonly _userMatchStorage: BlDocumentStorage<UserMatch>;
  constructor(userMatchStorage?: BlDocumentStorage<UserMatch>) {
    this._userMatchStorage =
      userMatchStorage ??
      new BlDocumentStorage(BlCollectionName.UserMatches, userMatchSchema);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = MatchLockSpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }

    const userMatches = (await this._userMatchStorage.aggregate([
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

    const res = await this._userMatchStorage.updateMany(
      {
        _id: { $in: userMatches.map((match) => match.id) },
      },
      { itemsLockedToMatch: parsedRequest.data.userMatchesLocked },
    );

    return new BlapiResponse([res]);
  }
}
