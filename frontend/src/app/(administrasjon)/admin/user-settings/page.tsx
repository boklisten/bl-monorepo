import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import UserSettings from "@/features/user/UserSettings";

export const metadata: Metadata = {
  title: "Brukerinnstillinger",
};

const SettingsPage = () => {
  return (
    <Container size={"xs"}>
      <Stack>
        <Title ta={"center"}>Brukerinnstillinger</Title>
        <UserSettings />
      </Stack>
    </Container>
  );
};

export default SettingsPage;
