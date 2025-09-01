import { Metadata } from "next";

import Reminders from "@/components/admin/Reminders";

export const metadata: Metadata = {
  title: "Påminnelser",
};

export default function RemindersPage() {
  return <Reminders />;
}
