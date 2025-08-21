import { Box } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";

import { add } from "@/api/storage";
import { publicApiClient } from "@/utils/api/publicApiClient";
import BL_CONFIG from "@/utils/bl-config";

export default function VippsButton({ verb }: { verb: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Box
      onClick={() => {
        const caller = searchParams.get("caller");
        const redirect = searchParams.get("redirect");
        if (caller) {
          add(BL_CONFIG.login.localStorageKeys.caller, caller);
        }
        if (redirect) {
          add(BL_CONFIG.login.localStorageKeys.redirect, redirect);
        }
        // @ts-expect-error fixme: bad routing types
        router.replace(publicApiClient.auth.vipps.redirect.$url());
      }}
    >
      {/* @ts-expect-error official Vipps button */}
      <vipps-mobilepay-button rounded="true" branded="true" verb={verb} />
    </Box>
  );
}
