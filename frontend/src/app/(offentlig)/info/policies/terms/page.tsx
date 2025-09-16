import { Metadata } from "next";

import EditableTextReadOnly from "@/features/editable-text/EditableTextReadOnly";
import { publicApiClient } from "@/shared/api/publicApiClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Vilkår",
  description:
    "Når du handler hos oss gjelder noen vilkår. Disse er her for å gi alle parter trygghet for hvilke regler som gjelder.",
};

export default async function TermsPage() {
  const dataKey = "vilkaar";
  const cachedData = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();

  return (
    <EditableTextReadOnly dataKey={dataKey} cachedText={cachedData.text} />
  );
}
