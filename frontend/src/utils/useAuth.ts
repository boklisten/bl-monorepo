"use client";

import {
  PERMISSION_LEVELS,
  UserPermission,
} from "@boklisten/backend/shared/permission/user-permission";
import { AccessToken } from "@boklisten/backend/shared/token/access-token";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { decodeToken } from "react-jwt";

import BL_CONFIG from "@/utils/bl-config";

export default function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false); // employee or above
  const [isManager, setIsManager] = useState(false); // manager or above
  const [isAdmin, setIsAdmin] = useState(false); // admin
  const [canAccess, setCanAccess] = useState<
    (required: UserPermission) => boolean
  >(() => () => false);

  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(false);

    const accessToken = decodeToken(
      localStorage.getItem(BL_CONFIG.token.accessToken) ?? "",
    ) as AccessToken | null;

    if (!accessToken) {
      setIsLoggedIn(false);
      setCanAccess(() => () => false);
      setIsEmployee(false);
      setIsManager(false);
      setIsAdmin(false);
      return;
    }
    setIsLoggedIn(true);
    const userPermissionLevel = PERMISSION_LEVELS[accessToken.permission];

    setIsEmployee(userPermissionLevel >= PERMISSION_LEVELS.employee);
    setIsManager(userPermissionLevel >= PERMISSION_LEVELS.manager);
    setIsAdmin(userPermissionLevel >= PERMISSION_LEVELS.admin);

    setCanAccess(
      () => (requiredPermission: UserPermission) =>
        userPermissionLevel >= PERMISSION_LEVELS[requiredPermission],
    );
  }, [pathname]);

  function logout() {
    localStorage.clear();
  }

  return {
    isLoading,
    isLoggedIn,
    isEmployee,
    isManager,
    isAdmin,
    canAccess,
    logout,
  };
}
