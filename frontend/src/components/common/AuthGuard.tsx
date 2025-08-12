"use client";
import { UserPermission } from "@boklisten/backend/shared/user-permission";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { getAccessTokenBody } from "@/api/token";
import useApiClient from "@/utils/api/useApiClient";
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
  const client = useApiClient();

  const {
    data: userDetail,
    isLoading: isLoadingUserDetail,
    isError: isErrorUserDetail,
  } = useQuery({
    queryKey: [client.v2.user_details.$url()],
    queryFn: () => {
      const { details } = getAccessTokenBody();
      if (!details) return null;
      return client.v2.user_details({ detailsId: details }).$get().unwrap();
    },
  });

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

    const pathName = pathname.slice(1);
    if (
      pathName !== "oppgaver" &&
      !isLoadingUserDetail &&
      !isErrorUserDetail &&
      (userDetail?.tasks?.confirmDetails || userDetail?.tasks?.signAgreement)
    ) {
      router.replace(`/oppgaver?redirect=${pathName}`);
    }
  }, [
    canAccess,
    isErrorUserDetail,
    isLoading,
    isLoadingUserDetail,
    isLoggedIn,
    pathname,
    requiredPermission,
    router,
    userDetail?.tasks?.confirmDetails,
    userDetail?.tasks?.signAgreement,
  ]);

  return <>{children}</>;
}
