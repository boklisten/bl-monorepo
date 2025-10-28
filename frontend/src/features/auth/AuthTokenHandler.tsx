"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent } from "react";

import useApiClient from "@/shared/hooks/useApiClient";
import useAuth from "@/shared/hooks/useAuth";
import useAuthLinker from "@/shared/hooks/useAuthLinker";
import { addAccessToken, addRefreshToken } from "@/shared/utils/token";

export default function AuthTokenHandler() {
  const client = useApiClient();
  const router = useRouter();
  const { isLoading, isLoggedIn } = useAuth();
  const { redirectToCaller } = useAuthLinker();
  const searchParameters = useSearchParams();
  const refreshToken = searchParameters.get("refresh_token");
  const accessToken = searchParameters.get("access_token");

  useEffect(() => {
    if (accessToken && refreshToken) {
      addAccessToken(accessToken);
      addRefreshToken(refreshToken);
    }
  }, [accessToken, refreshToken]);

  const onLogin = useEffectEvent(async (success: boolean) => {
    if (!success) {
      router.push("/auth/failure");
      return;
    }
    const userDetail = await client.v2.user_details.me.$get().unwrap();
    if (userDetail?.tasks?.confirmDetails || userDetail?.tasks?.signAgreement) {
      router.push("/oppgaver");
    } else {
      redirectToCaller();
    }
  });
  useEffect(() => {
    if (isLoading) return;
    void onLogin(isLoggedIn);
  }, [isLoading, isLoggedIn]);

  return null;
}
