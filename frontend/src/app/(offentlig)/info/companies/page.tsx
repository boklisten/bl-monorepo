import { Metadata } from "next";

import EditableTextReadOnly from "@/components/info/editable-text/EditableTextReadOnly";
import { publicApiClient } from "@/utils/api/publicApiClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "For skolekunder",
  description:
    "Er du ansvarlig for en videregående eller privatist-skole? Vi tilbyr en rekke nyttige tjenester til dere! Les om våre tilbud til skoler, hvordan utlånsordningen fungrer og hvordan dere kan kjøpe bøker fra skyvearkivet.",
};

export default async function CompaniesPage() {
  const dataKey = "for_skolekunder";
  const cachedData = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();

  return (
    <EditableTextReadOnly dataKey={dataKey} cachedText={cachedData.text} />
  );
}
