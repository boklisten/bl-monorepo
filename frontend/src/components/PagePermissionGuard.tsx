"use client";

import { UserPermission } from "@boklisten/bl-model";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { isAdmin, isEmployee, isLoggedIn, isManager } from "@/api/auth";

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
