import { Box } from "@mui/material";
import Script from "next/script";

import useSocialLogin from "@/utils/useSocialLogin";

export default function VippsButton({ verb }: { verb: "login" | "register" }) {
  const { redirectToLogin } = useSocialLogin();

  // fixme: remove this to enable Vipps-login in production (waiting for API keys from Vipps)
  if (process.env["NEXT_PUBLIC_APP_ENV"] === "production") return <></>;

  return (
    <>
      <Script src="https://checkout.vipps.no/checkout-button/v1/vipps-checkout-button.js" />
      <Box onClick={() => redirectToLogin("vipps")}>
        {/* @ts-expect-error official Vipps button */}
        <vipps-mobilepay-button rounded="true" branded="true" verb={verb} />
      </Box>
    </>
  );
}
