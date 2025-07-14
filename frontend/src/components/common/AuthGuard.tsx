"use client";
import { UserPermission } from "@boklisten/backend/shared/permission/user-permission";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import useAuth from "@/utils/useAuth";

/**
 *
 * Ensures that a user is logged in and optionally has the correct permission level
 */
export default function AuthGuard({
  children,
  requiredPermission,
}: {
  children: ReactNode;
  requiredPermission?: UserPermission;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isLoggedIn, canAccess } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn) {
      router.replace(`/auth/login?redirect=${pathname.slice(1)}`);
      return;
    }

    if (requiredPermission && !canAccess(requiredPermission)) {
      router.replace("/auth/permission/denied");
      return;
    }
  }, [canAccess, isLoading, isLoggedIn, pathname, requiredPermission, router]);

  return <>{children}</>;
}
