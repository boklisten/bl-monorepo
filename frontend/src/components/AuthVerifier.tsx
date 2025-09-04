"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getAccessTokenBody } from "@/api/token";
import useApiClient from "@/hooks/useApiClient";
import useAuth from "@/hooks/useAuth";
import useAuthLinker from "@/hooks/useAuthLinker";

export default function AuthVerifier() {
  const client = useApiClient();
  const router = useRouter();
  const { isLoading, isLoggedIn } = useAuth();
  const { redirectToCaller } = useAuthLinker();

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn) router.push("/auth/failure");

    const { details } = getAccessTokenBody();
    const checkUserDetailsValid = async () => {
      const userDetail = await client.v2
        .user_details({ detailsId: details })
        .$get()
        .unwrap();
      if (
        userDetail?.tasks?.confirmDetails ||
        userDetail?.tasks?.signAgreement
      ) {
        router.push("/oppgaver");
      } else {
        redirectToCaller();
      }
    };
    void checkUserDetailsValid();
  }, [client, isLoading, isLoggedIn, redirectToCaller, router]);
  return null;
}
