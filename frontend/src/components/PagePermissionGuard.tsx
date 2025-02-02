"use client";

import { UserPermission } from "@boklisten/backend/shared/permission/user-permission";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { isAdmin, isEmployee, isLoggedIn, isManager } from "@/api/auth";

export default function PagePermissionGuard({
  requiredPermission,
}: {
  requiredPermission?: UserPermission;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const goToPermissionDeniedPage = () => {
      router.replace("/auth/permission/denied");
    };

    const goToLoginPage = () => {
      router.replace(`/auth/login?redirect=${pathname.slice(1)}`);
    };
    if (requiredPermission && !isLoggedIn()) {
      return goToLoginPage();
    }
    switch (requiredPermission) {
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
  }, [pathname, requiredPermission, router]);
  return <></>;
}
