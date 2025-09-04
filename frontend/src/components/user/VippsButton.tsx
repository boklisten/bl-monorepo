"use client";
import { Center } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";

import { add } from "@/api/storage";
import BL_CONFIG from "@/utils/bl-config";
import { publicApiClient } from "@/utils/publicApiClient";

export default function VippsButton({ verb }: { verb: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Center
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
    </Center>
  );
}
