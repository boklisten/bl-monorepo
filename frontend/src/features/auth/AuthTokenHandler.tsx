"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent } from "react";

import useApiClient from "@/shared/hooks/useApiClient";
import { login } from "@/shared/hooks/useAuth";
import useAuthLinker from "@/shared/hooks/useAuthLinker";

export default function AuthTokenHandler() {
  const client = useApiClient();
  const router = useRouter();
  const { redirectToCaller } = useAuthLinker();
  const searchParameters = useSearchParams();
  const refreshToken = searchParameters.get("refresh_token");
  const accessToken = searchParameters.get("access_token");

  const onLogin = useEffectEvent(
    async (tokens: { accessToken: string; refreshToken: string }) => {
      const success = login(tokens);
      if (!success) {
        router.push("/auth/failure");
        return;
      }
      const userDetail = await client.v2.user_details.me.$get().unwrap();
      if (
        userDetail?.tasks?.confirmDetails ||
        userDetail?.tasks?.signAgreement
      ) {
        router.push("/oppgaver");
      } else {
        redirectToCaller();
      }
    },
  );
  useEffect(() => {
    if (accessToken && refreshToken) {
      void onLogin({ accessToken, refreshToken });
    }
  }, [accessToken, refreshToken]);

  return null;
}
