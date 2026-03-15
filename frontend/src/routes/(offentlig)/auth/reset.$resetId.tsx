import { Container, Stack, Title } from "@mantine/core";

import PasswordReset from "@/features/auth/PasswordReset";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/auth/reset/$resetId")({
  head: () => ({
    meta: [
      { title: "Lag nytt passord | Boklisten.no" },
      {
        description: "Lag et nytt passord, slik at du får tilgang på kontoen din.",
      },
    ],
  }),
  validateSearch: (search) => ({
    resetToken: (search["resetToken"] as string) || "",
  }),
  component: PasswordResetPage,
});

function PasswordResetPage() {
  const { resetId } = Route.useParams();
  return (
    <Container size={"xs"}>
      <Stack>
        <Title>Lag nytt passord</Title>
        <PasswordReset resetId={resetId} />
      </Stack>
    </Container>
  );
}
