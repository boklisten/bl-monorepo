import { Box } from "@mui/material";

import useSocialLogin from "@/utils/useSocialLogin";

export default function VippsButton({ verb }: { verb: "login" | "register" }) {
  const { redirectToLogin } = useSocialLogin();

  return (
    <Box onClick={() => redirectToLogin("vipps")}>
      {/* @ts-expect-error official Vipps button */}
      <vipps-mobilepay-button rounded="true" branded="true" verb={verb} />
    </Box>
  );
}
