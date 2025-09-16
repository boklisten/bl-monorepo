import { Metadata } from "next";

import EditableTextReadOnly from "@/features/editable-text/EditableTextReadOnly";
import { publicApiClient } from "@/shared/api/publicApiClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Om oss",
  description:
    "Boklisten har mange års erfaring med kjøp og salg av pensumbøker. Les om vår historie, hvem vi er, og hva vi tilbyr.",
};

export default async function AboutPage() {
  const dataKey = "om_oss";
  const cachedData = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();

  return (
    <EditableTextReadOnly dataKey={dataKey} cachedText={cachedData.text} />
  );
}
