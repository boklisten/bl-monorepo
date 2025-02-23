"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { isLoggedIn } from "@/api/auth";
import BlFetcher from "@/api/blFetcher";
import { get } from "@/api/storage";
import { getAccessTokenBody } from "@/api/token";
import { selectRedirectTarget } from "@/components/AuthLinker";
import useApiClient from "@/utils/api/useApiClient";
import BL_CONFIG from "@/utils/bl-config";

export default function AuthVerifier() {
  const client = useApiClient();
  const router = useRouter();
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/auth/failure");
    }
    const { details } = getAccessTokenBody();
    const checkUserDetailsValid = async () => {
      try {
        const [{ valid }] = await BlFetcher.get<[{ valid: boolean }]>(
          client.$url("collection.userdetails.operation.valid.getId", {
            params: { id: details },
          }),
        );
        if (valid) {
          const caller = get(BL_CONFIG.login.localStorageKeys.caller);
          const redirect = get(BL_CONFIG.login.localStorageKeys.redirect);
          router.push(selectRedirectTarget(caller, redirect));
        } else {
          router.push("/user-settings");
        }
      } catch {
        router.push("/auth/failure");
      }
    };
    checkUserDetailsValid();
  }, [client, router]);
  return null;
}
