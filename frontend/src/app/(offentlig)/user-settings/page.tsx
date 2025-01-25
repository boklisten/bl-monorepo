import { Metadata } from "next";

import UserSettings from "@/components/user/UserSettings";

export const metadata: Metadata = {
  title: "Brukerinnstillinger",
  description: "Endre din informasjon",
};

const SettingsPage = () => {
  return <UserSettings />;
};

export default SettingsPage;
