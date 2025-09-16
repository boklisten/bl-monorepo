import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import AuthGuard from "@/features/auth/AuthGuard";
import UserSettings from "@/features/user/UserSettings";

export const metadata: Metadata = {
  title: "Brukerinnstillinger",
  description: "Endre din informasjon",
};

const SettingsPage = () => {
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
};

export default SettingsPage;
