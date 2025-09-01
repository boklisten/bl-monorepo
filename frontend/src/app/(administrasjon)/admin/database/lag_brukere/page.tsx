import { Metadata } from "next";

import CreateUsers from "@/components/admin/CreateUsers";

export const metadata: Metadata = {
  title: "Lag brukere",
};

export default function CreateUsersPage() {
  return <CreateUsers />;
}
