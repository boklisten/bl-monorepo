import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";

import BlFetcher from "@/api/blFetcher";
import { parseTokensFromResponseDataAndStore } from "@/api/token";
import { publicApiClient } from "@/utils/api/publicApiClient";
import { AuthResponse } from "@/utils/types";

export const registerUser = async (
  username: string,
  password: string,
): Promise<AuthResponse> => {
  const registerResponse = await BlFetcher.post<AuthResponse>(
    publicApiClient.$url("auth.local.register"),
    {
      username,
      password,
    },
  );
  parseTokensFromResponseDataAndStore(registerResponse);
  return registerResponse;
};

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
