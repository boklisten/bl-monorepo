import { Container } from "@mantine/core";
import { Metadata } from "next";

import AuthGuard from "@/components/common/AuthGuard";
import UserSettings from "@/components/user/UserSettings";

export const metadata: Metadata = {
  title: "Brukerinnstillinger",
  description: "Endre din informasjon",
};

const SettingsPage = () => {
  return (
    <Container size={"xs"}>
      <AuthGuard>
        <UserSettings />
      </AuthGuard>
    </Container>
  );
};

export default SettingsPage;
