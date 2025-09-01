import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import AuthGuard from "@/components/common/AuthGuard";
import UserSettings from "@/components/user/UserSettings";

export const metadata: Metadata = {
  title: "Brukerinnstillinger",
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
