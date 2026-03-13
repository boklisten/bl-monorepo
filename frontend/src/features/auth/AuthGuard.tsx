import type { UserPermission } from "@boklisten/backend/shared/user-permission";
import { Activity, type ReactNode, useEffect, useEffectEvent, useState } from "react";

import useApiClient from "@/shared/hooks/useApiClient";
import useAuth from "@/shared/hooks/useAuth";
import { useLocation, useNavigate } from "@tanstack/react-router";

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
  const pathname = useLocation({ select: (location) => location.pathname });
  const navigate = useNavigate();
  const { isLoading, isLoggedIn, canAccess } = useAuth();
  const { client } = useApiClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const onAuthChange = useEffectEvent(async () => {
    if (!isLoggedIn) {
      navigate({ to: "/auth/login", search: { redirect: pathname.slice(1) } });
      return;
    }

    if (requiredPermission && !canAccess(requiredPermission)) {
      navigate({ to: "/auth/permission/denied" });
      return;
    }

    const userDetail = await client.api.userDetail.getMyDetails({});
    if (
      !pathname.includes("oppgaver") &&
      !pathname.includes("user-settings") &&
      (userDetail?.tasks?.confirmDetails || userDetail?.tasks?.signAgreement)
    ) {
      navigate({ to: "/oppgaver", search: { redirect: pathname.slice(1) } });
      return;
    }
    setIsAuthenticated(true);
  });

  useEffect(() => {
    if (isLoading) return;
    void onAuthChange();
  }, [isLoading, isLoggedIn]);

  return <Activity mode={isAuthenticated ? "visible" : "hidden"}>{children}</Activity>;
}
