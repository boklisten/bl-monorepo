"use client";

import AdminNavigationCards from "@frontend/components/AdminNavigationCards";
import { COMMUNICATION_SUB_PAGES } from "@frontend/utils/adminNavigation";

export default function CommunicationRootPage() {
  /**
   * TODO: estimat på antall mottakere
   *
   * Flow:
   *     > Kunder med overleveringer
   *     => Velg Skoler (Toggle button (alle / multi-select)
   *     => Velg ALLE / sendere / mottakere / kun stand
   *     => Velg SMS eller E-post (templateID)
   *
   */
  return (
    <AdminNavigationCards
      navLinks={COMMUNICATION_SUB_PAGES}
      label={"Velg verktøy"}
      rootPath={"/admin/kommunikasjon"}
    />
  );
}
