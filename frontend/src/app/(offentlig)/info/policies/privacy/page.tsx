import { Metadata } from "next";

import EditableTextReadOnly from "@/shared/components/editable-text/EditableTextReadOnly";
import { publicApiClient } from "@/shared/hooks/publicApiClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Personvernavtale",
  description:
    "Vi tar personvern på alvor. Derfor har vi laget et dokument som viser en oversikt over hvordan din data bir behandlet hos oss.",
};

export default async function PrivacyPage() {
  const dataKey = "personvernavtale";
  const cachedData = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();

  return (
    <EditableTextReadOnly dataKey={dataKey} cachedText={cachedData.text} />
  );
}
