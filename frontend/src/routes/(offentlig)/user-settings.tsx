import { Container, Stack, Title } from "@mantine/core";
import AuthGuard from "@/features/auth/AuthGuard";
import UserSettings from "@/features/user/UserSettings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/user-settings")({
  head: () => ({
    meta: [
      { title: "Brukerinnstillinger | Boklisten.no" },
      {
        description: "Endre din informasjon",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Container size={"xs"}>
      <Stack>
        <Title ta={"center"}>Brukerinnstillinger</Title>
        <AuthGuard>
          <UserSettings />
        </AuthGuard>
      </Stack>
    </Container>
  );
}
