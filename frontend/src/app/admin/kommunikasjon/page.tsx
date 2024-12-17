"use client";
import { PageContainer } from "@toolpad/core";

import AdminNavigationCards from "@/components/AdminNavigationCards";
import { COMMUNICATION_SUB_PAGES } from "@/utils/adminNavigation";

export default function CommunicationRootPage() {
  /**
   * TODO: estimat på antall mottakere
   *
   * Flow:
   *     Velg kundegruppe
   *     kunder med bokfrist | kunder med overleveringer
   *
   *     > Kunder med bokfrist
   *     => Velg FRIST (Toggle buttons / date picker)
   *     => Velg elevgruppe (privatist/vgs)
   *     => Velg Skoler (Toggle button (alle / multi-select)
   *     => Velg SMS eller E-post
   *     >>> SMS => Fritekst
   *     >>> E-post (TemplateID)
   *
   *     > Kunder med overleveringer
   *     => Velg Skoler (Toggle button (alle / multi-select)
   *     => Velg ALLE / sendere / mottakere / kun stand
   *     => Velg SMS eller E-post (templateID)
   *
   */
  return (
    <PageContainer sx={{ justifyContent: "center" }}>
      <AdminNavigationCards
        navLinks={COMMUNICATION_SUB_PAGES}
        label={"Velg anledning"}
        rootPath={"/admin/kommunikasjon"}
      />
    </PageContainer>
  );
}
