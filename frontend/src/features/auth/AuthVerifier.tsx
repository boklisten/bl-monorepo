"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import useAuth from "@/features/auth/useAuth";
import useAuthLinker from "@/features/auth/useAuthLinker";
import useApiClient from "@/shared/api/useApiClient";

export default function AuthVerifier() {
  const client = useApiClient();
  const router = useRouter();
  const { isLoading, isLoggedIn } = useAuth();
  const { redirectToCaller } = useAuthLinker();

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn) router.push("/auth/failure");

    const checkUserDetailsValid = async () => {
      const userDetail = await client.v2.user_details.me.$get().unwrap();
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
