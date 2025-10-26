"use client";
import { useRouter, useSearchParams } from "next/navigation";

import useAuth from "@/shared/hooks/useAuth";
import BL_CONFIG from "@/shared/utils/bl-config";

export default function useAuthLinker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, isLoggedIn } = useAuth();

  function redirectToBlAdmin(path: string, retainHistory?: boolean) {
    if (isLoading) return;

    const url = new URL(
      `${BL_CONFIG.blAdmin.basePath}${path}?${searchParams.toString()}`,
    );

    if (isLoggedIn) {
      const accessToken = localStorage.getItem(BL_CONFIG.token.accessToken);
      const refreshToken = localStorage.getItem(BL_CONFIG.token.refreshToken);
      if (accessToken && refreshToken) {
        url.searchParams.append("refresh_token", refreshToken);
        url.searchParams.append("access_token", accessToken);
      }
    }
    if (retainHistory) {
      // @ts-expect-error fixme: bad routing types
      router.push(url.toString());
    } else {
      // @ts-expect-error fixme: bad routing types
      router.replace(url.toString());
    }
  }

  function redirectToCaller() {
    const { localStorageKeys } = BL_CONFIG.login;

    const caller =
      searchParams.get("caller") ??
      localStorage.getItem(localStorageKeys.caller);

    const redirect =
      searchParams.get("redirect") ??
      localStorage.getItem(localStorageKeys.redirect) ??
      "";

    localStorage.removeItem(localStorageKeys.caller);
    localStorage.removeItem(localStorageKeys.redirect);

    if (caller === null) {
      // @ts-expect-error fixme: bad routing types
      router.replace(`/${redirect}`);
      return;
    }

    if (caller !== "bl-admin") {
      throw new Error("Invalid caller");
    }
    redirectToBlAdmin(`auth/gateway?redirect=${redirect}`);
  }

  return { redirectToBlAdmin, redirectToCaller };
}
