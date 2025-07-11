import vine from "@vinejs/vine";
import { ObjectId } from "mongodb";

import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { UserMatch } from "#shared/match/user-match";

const matchLockValidator = vine.object({
  customerId: vine.string(),
  userMatchesLocked: vine.boolean(),
});

export class UserMatchLockOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const { customerId, userMatchesLocked } = await vine.validate({
      schema: matchLockValidator,
      data: blApiRequest.data,
    });

    const userMatches = (await BlStorage.UserMatches.aggregate([
      {
        $match: {
          $or: [
            { customerA: new ObjectId(customerId) },
            { customerB: new ObjectId(customerId) },
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
      { itemsLockedToMatch: userMatchesLocked },
    );

    return new BlapiResponse([res]);
  }
}
