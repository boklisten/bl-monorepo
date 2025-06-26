import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";

import BlFetcher from "@/api/blFetcher";
import { parseTokensFromResponseDataAndStore } from "@/api/token";
import { apiClient } from "@/utils/api/apiClient";
import { AuthResponse } from "@/utils/types";

export const registerUser = async (
  username: string,
  password: string,
): Promise<AuthResponse> => {
  const registerResponse = await BlFetcher.post<AuthResponse>(
    apiClient.$url("auth.local.register"),
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
    apiClient.$url("collection.userdetails.patch", {
      params: { id: userId },
    }),
    userDetails,
  );
};

export const resetPassword = async (
  userId: string,
  resetToken: string,
  newPassword: string,
) => {
  return await BlFetcher.patch(
    apiClient.$url("collection.pendingpasswordresets.operation.confirm.patch", {
      params: { id: userId },
    }),
    {
      resetToken,
      newPassword,
    },
  );
};
