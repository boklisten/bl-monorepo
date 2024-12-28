import UserSettings from "@frontend/components/user/UserSettings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brukerinnstillinger",
  description: "Endre din informasjon",
};

const SettingsPage = () => {
  return <UserSettings />;
};

export default SettingsPage;
