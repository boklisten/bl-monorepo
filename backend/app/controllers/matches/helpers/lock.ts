import { Infer } from "@vinejs/vine/types";
import { ObjectId } from "mongodb";

import { StorageService } from "#services/storage_service";
import { BlError } from "#shared/bl-error";
import { UserMatch } from "#shared/match/user-match";
import { matchLockSchema } from "#validators/matches";

export async function lock({
  customerId,
  userMatchesLocked,
}: Infer<typeof matchLockSchema>) {
  const userMatches = (await StorageService.UserMatches.aggregate([
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

  await StorageService.UserMatches.updateMany(
    {
      _id: { $in: userMatches.map((match) => match.id) },
    },
    { itemsLockedToMatch: userMatchesLocked },
  );
  return { userMatchesLocked };
}
