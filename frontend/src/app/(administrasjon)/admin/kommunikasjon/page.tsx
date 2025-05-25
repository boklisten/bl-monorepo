"use client";

import AdminNavigationCards from "@/components/AdminNavigationCards";
import { COMMUNICATION_SUB_PAGES } from "@/utils/adminNavigation";

export default function CommunicationRootPage() {
  return (
    <AdminNavigationCards
      navLinks={COMMUNICATION_SUB_PAGES}
      label={"Velg verktøy"}
      rootPath={"/admin/kommunikasjon"}
    />
  );
}
