import { Metadata } from "next";

import EditableTextReadOnly from "@/components/info/editable-text/EditableTextReadOnly";
import { publicApiClient } from "@/utils/publicApiClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Spørsmål og svar",
  description:
    "Hva betyr det at Boklisten alltid leverer riktig bok? Hvordan bestiller jeg bøker som privatist?",
};

export default async function FaqPage() {
  const dataKey = "sporsmal_og_svar";
  const cachedData = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();

  return (
    <EditableTextReadOnly dataKey={dataKey} cachedText={cachedData.text} />
  );
}
