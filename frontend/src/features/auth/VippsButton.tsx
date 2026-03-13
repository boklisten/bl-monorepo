import { Center } from "@mantine/core";

import BL_CONFIG from "@/shared/utils/bl-config";
import { publicApiClient } from "@/shared/utils/publicApiClient";
import { useLocation, useNavigate } from "@tanstack/react-router";

export default function VippsButton({ verb }: { verb: "login" | "register" }) {
  const navigate = useNavigate();
  const search = useLocation({ select: (location) => location.search });

  return (
    <Center
      onClick={() => {
        if (search.caller) {
          localStorage.setItem(BL_CONFIG.login.localStorageKeys.caller, search.caller);
        }
        if (search.redirect) {
          localStorage.setItem(BL_CONFIG.login.localStorageKeys.redirect, search.redirect);
        }
        navigate({
          href: BL_CONFIG.api.basePath.slice(0, -1) + publicApiClient.urlFor("vipps.redirect"),
        });
      }}
    >
      {/* @ts-expect-error official Vipps button */}
      <vipps-mobilepay-button rounded="true" branded="true" verb={verb} />
    </Center>
  );
}
