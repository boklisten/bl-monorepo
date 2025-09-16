import { Metadata } from "next";

import EditableTextReadOnly from "@/features/editable-text/EditableTextReadOnly";
import { publicApiClient } from "@/shared/hooks/publicApiClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Betingelser",
  description:
    "Vi tar kundene våre på alvor. Derfor har vi laget detaljerte betingelser, slik at du vet hva som gjelder for din ordre.",
};

export default async function ConditionsPage() {
  const dataKey = "betingelser";
  const cachedData = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();

  return (
    <EditableTextReadOnly dataKey={dataKey} cachedText={cachedData.text} />
  );
}
