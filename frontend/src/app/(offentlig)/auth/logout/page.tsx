"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { logout } from "@/api/auth";
import BL_CONFIG from "@/utils/bl-config";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    logout();
    router.replace(`${BL_CONFIG.blWeb.basePath}logout`);
  }, [router]);

  return null;
  /**
     * Use this as the landing page for logout bl-web is deprecated.
  return (
    <Card sx={{ paddingBottom: 4 }}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h1">
            Du er nå logget ut
          </Typography>
        </Box>
      </Container>
    </Card>
  );
     */
}
