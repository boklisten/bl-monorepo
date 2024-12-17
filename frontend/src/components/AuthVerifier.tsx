"use client";

import { isLoggedIn } from "@frontend/api/auth";
import BlFetcher from "@frontend/api/blFetcher";
import { get } from "@frontend/api/storage";
import { getAccessTokenBody } from "@frontend/api/token";
import { selectRedirectTarget } from "@frontend/components/AuthLinker";
import BL_CONFIG from "@frontend/utils/bl-config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthVerifier() {
  const router = useRouter();
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/auth/failure");
    }
    const { details } = getAccessTokenBody();
    const checkUserDetailsValid = async () => {
      try {
        const [{ valid }] = await BlFetcher.get<[{ valid: boolean }]>(
          `${BL_CONFIG.collection.userDetail}/${details}/valid`,
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
  }, [router]);
  return null;
}
