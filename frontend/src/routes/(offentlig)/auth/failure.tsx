import { Container, Stack, Title } from "@mantine/core";

import AuthFailureReasonAlert from "@/features/auth/AuthFailureReasonAlert.tsx";
import TanStackAnchor from "@/shared/components/TanStackAnchor.tsx";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants.ts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/auth/failure")({
  head: () => ({
    meta: [
      { title: "Klarte ikke logge inn | Boklisten.no" },
      {
        description: `Vi klarte ikke å logge deg inn. ${PLEASE_TRY_AGAIN_TEXT}`,
      },
    ],
  }),
  validateSearch: (search): { reason?: string } => ({
    reason: (search["reason"] as string) || "",
  }),
  component: AuthFailurePage,
});

function AuthFailurePage() {
  const { reason } = Route.useSearch();
  return (
    <Container>
      <Stack align={"center"}>
        <Title>Vi klarte ikke logge deg inn</Title>
        <AuthFailureReasonAlert reason={reason ?? ""} />
        <TanStackAnchor to={"/auth/login"}>Tilbake til innloggingssiden</TanStackAnchor>
      </Stack>
    </Container>
  );
}
