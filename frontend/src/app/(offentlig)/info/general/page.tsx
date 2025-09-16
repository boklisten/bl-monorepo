import { Metadata } from "next";

import EditableTextReadOnly from "@/features/editable-text/EditableTextReadOnly";
import { publicApiClient } from "@/shared/hooks/publicApiClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Generell informasjon",
  description:
    "Velkommen til Boklisten.no! Her kan du enkelt kjøpe pensumbøker. Les om vårt konsept, og hvilke tjenester vi tilbyr her.",
};

export default async function GeneralInformationPage() {
  const dataKey = "generell_informasjon";
  const cachedData = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();

  return (
    <EditableTextReadOnly dataKey={dataKey} cachedText={cachedData.text} />
  );
}
