"use client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { isEmployee, isLoggedIn } from "@/api/auth";
import {
  addAccessToken,
  addRefreshToken,
  getAccessToken,
  getRefreshToken,
} from "@/api/token";
import BL_CONFIG from "@/utils/bl-config";

export function attachTokensToHref(href: string) {
  if (
    (href.includes(BL_CONFIG.blWeb.basePath) ||
      href.includes(BL_CONFIG.blAdmin.basePath)) &&
    isLoggedIn()
  ) {
    const url = new URL(href);
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    if (accessToken && refreshToken) {
      url.searchParams.append("refresh_token", refreshToken);
      url.searchParams.append("access_token", accessToken);
    }
    return url.toString();
  }
  return href;
}

export function selectRedirectTarget(
  caller: string | null,
  redirect: string | null,
): string {
  if (caller === "bl-web") {
    return `${BL_CONFIG.blWeb.basePath}auth/gateway?redirect=${redirect}`;
  }
  if (caller === "bl-admin") {
    return isEmployee()
      ? `${BL_CONFIG.blAdmin.basePath}auth/gateway`
      : "/auth/permission/denied";
  }
  return `/${redirect ?? ""}`;
}

export function executeReturnRedirect(
  searchParams: ReadonlyURLSearchParams,
  router: AppRouterInstance,
) {
  const caller = searchParams.get("caller");
  const redirect = searchParams.get("redirect");
  router.replace(attachTokensToHref(selectRedirectTarget(caller, redirect)));
}

export default function AuthLinker({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParameters = useSearchParams();
  const [authProcessed, setAuthProcessed] = useState(false);

  useEffect(() => {
    const refresh_token = searchParameters.get("refresh_token");
    const access_token = searchParameters.get("access_token");

    if (refresh_token && access_token) {
      addAccessToken(access_token);
      addRefreshToken(refresh_token);
      // Clear tokens from search params
      const params = new URLSearchParams(searchParameters.toString());
      params.delete("refresh_token");
      params.delete("access_token");
      router.replace(pathname + "?" + params);
    }
    setAuthProcessed(true);
  }, [pathname, router, searchParameters]);

  if (!authProcessed) {
    return null;
  }
  return <>{children}</>;
}
