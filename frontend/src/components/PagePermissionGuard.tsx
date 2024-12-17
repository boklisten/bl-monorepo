"use client";

import { isAdmin, isEmployee, isLoggedIn, isManager } from "@frontend/api/auth";
import { UserPermission } from "@shared/permission/user-permission";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

export default function PagePermissionGuard({
  requiredPermission,
}: {
  requiredPermission?: UserPermission;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const goToPermissionDeniedPage = useCallback(() => {
    router.replace("/auth/permission/denied");
  }, [router]);

  const goToLoginPage = useCallback(() => {
    router.replace(`/auth/login?redirect=${pathname.slice(1)}`);
  }, [router, pathname]);

  useEffect(() => {
    if (requiredPermission && !isLoggedIn()) {
      return goToLoginPage();
    }
    switch (requiredPermission) {
      case "super":
      case "admin": {
        if (!isAdmin()) goToPermissionDeniedPage();
        break;
      }
      case "manager": {
        if (!isManager()) goToPermissionDeniedPage();
        break;
      }
      case "employee": {
        if (!isEmployee()) goToPermissionDeniedPage();
        break;
      }
      default:
      // The page is publicly available
    }
  }, [goToLoginPage, goToPermissionDeniedPage, requiredPermission]);
  return <></>;
}
