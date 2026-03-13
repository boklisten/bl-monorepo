import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Title } from "@mantine/core";
import UserSettings from "@/features/user/UserSettings";

export const Route = createFileRoute("/(administrasjon)/admin/user-settings")({
  head: () => ({
    meta: [{ title: "Brukerinnstillinger | bl-admin" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Container size={"xs"}>
      <Stack>
        <Title ta={"center"}>Brukerinnstillinger</Title>
        <UserSettings />
      </Stack>
    </Container>
  );
}
