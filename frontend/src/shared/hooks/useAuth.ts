"use client";

import { AccessToken } from "@boklisten/backend/shared/access-token";
import {
  PERMISSION_LEVELS,
  UserPermission,
} from "@boklisten/backend/shared/user-permission";
import { decodeToken } from "react-jwt";

import useLocalStorageSubscription from "@/shared/hooks/useLocalStorageSubscription";
import BL_CONFIG from "@/shared/utils/bl-config";

export default function useAuth() {
  const token = useLocalStorageSubscription(BL_CONFIG.token.accessToken);

  const accessToken = decodeToken(token ?? "") as AccessToken | null;

  const permissionLevel = accessToken
    ? PERMISSION_LEVELS[accessToken.permission]
    : -1;

  return {
    isLoading: token === null,
    isLoggedIn: !!accessToken,
    isEmployee: permissionLevel >= PERMISSION_LEVELS.employee,
    isManager: permissionLevel >= PERMISSION_LEVELS.manager,
    isAdmin: permissionLevel >= PERMISSION_LEVELS.admin,
    canAccess: (requiredPermission: UserPermission) =>
      permissionLevel >= PERMISSION_LEVELS[requiredPermission],
    logout: () => {
      sessionStorage.clear();
      localStorage.clear();
    },
  };
}
