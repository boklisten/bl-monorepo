import { SocialProvider } from "@boklisten/backend/app/services/types/user";
import { useRouter, useSearchParams } from "next/navigation";

import { add } from "@/api/storage";
import { publicApiClient } from "@/utils/api/publicApiClient";
import BL_CONFIG from "@/utils/bl-config";

export default function useSocialLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return {
    redirectToLogin(provider: SocialProvider) {
      const caller = searchParams.get("caller");
      const redirect = searchParams.get("redirect");
      if (caller) {
        add(BL_CONFIG.login.localStorageKeys.caller, caller);
      }
      if (redirect) {
        add(BL_CONFIG.login.localStorageKeys.redirect, redirect);
      }
      router.replace(publicApiClient.auth({ provider }).redirect.$url());
    },
  };
}
