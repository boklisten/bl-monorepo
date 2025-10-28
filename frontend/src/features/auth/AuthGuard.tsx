"use client";
import { UserPermission } from "@boklisten/backend/shared/user-permission";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ReactNode,
  useEffect,
  useEffectEvent,
  useState,
} from "react";

import useApiClient from "@/shared/hooks/useApiClient";
import useAuth from "@/shared/hooks/useAuth";

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
  const client = useApiClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const onAuthChange = useEffectEvent(async () => {
    if (!isLoggedIn) {
      router.replace(`/auth/login?redirect=${pathname.slice(1)}`);
      return;
    }

    if (requiredPermission && !canAccess(requiredPermission)) {
      router.replace("/auth/permission/denied");
      return;
    }

    const userDetail = await client.v2.user_details.me.$get().unwrap();
    if (
      !pathname.includes("oppgaver") &&
      !pathname.includes("user-settings") &&
      (userDetail?.tasks?.confirmDetails || userDetail?.tasks?.signAgreement)
    ) {
      router.replace(`/oppgaver?redirect=${pathname.slice(1)}`);
      return;
    }
    setIsAuthenticated(true);
  });

  useEffect(() => {
    if (isLoading) return;
    void onAuthChange();
  }, [isLoading, isLoggedIn]);

  return (
    <Activity mode={isAuthenticated ? "visible" : "hidden"}>
      {children}
    </Activity>
  );
}
