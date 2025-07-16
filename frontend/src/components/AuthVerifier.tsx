"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getAccessTokenBody } from "@/api/token";
import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";
import useAuth from "@/utils/useAuth";
import useAuthLinker from "@/utils/useAuthLinker";

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
      try {
        const [{ valid }] = await client
          .$route("collection.userdetails.operation.valid.getId", {
            id: details,
          })
          .$get()
          .then(unpack<[{ valid: boolean }]>);
        if (valid) {
          redirectToCaller();
        } else {
          router.push("/user-settings");
        }
      } catch {
        router.push("/auth/failure");
      }
    };
    void checkUserDetailsValid();
  }, [client, isLoading, isLoggedIn, redirectToCaller, router]);
  return null;
}
