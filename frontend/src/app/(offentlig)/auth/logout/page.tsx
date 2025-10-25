"use client";
import { useMounted } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import useAuth from "@/shared/hooks/useAuth";
import BL_CONFIG from "@/shared/utils/bl-config";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;
    logout();
    // @ts-expect-error fixme: bad routing types
    router.replace(`${BL_CONFIG.blWeb.basePath}logout`);
  }, [logout, mounted, router]);

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
