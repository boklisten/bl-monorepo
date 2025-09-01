import { Metadata } from "next";

import WaitingList from "@/components/admin/waiting-list/WaitingList";

export const metadata: Metadata = {
  title: "Venteliste",
};

export default function WaitingListPage() {
  return <WaitingList />;
}
