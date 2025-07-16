import { Infer } from "@vinejs/vine/types";
import { ObjectId } from "mongodb";

import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { UserMatch } from "#shared/match/user-match";
import { matchLockSchema } from "#validators/matches";

// This is still used by bl-admin, hence the Blapiresponses
export async function lock({
  customerId,
  userMatchesLocked,
}: Infer<typeof matchLockSchema>) {
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
