import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";

import BlFetcher from "@/api/blFetcher";
import { publicApiClient } from "@/utils/api/publicApiClient";

export const updateUserDetails = async (
  userId: string,
  userDetails: Partial<UserDetail>,
) => {
  return await BlFetcher.patch(
    publicApiClient.$url("collection.userdetails.patch", {
      params: { id: userId },
    }),
    userDetails,
  );
};
