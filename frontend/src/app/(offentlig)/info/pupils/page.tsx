import { Metadata } from "next";

import EditableTextReadOnly from "@/features/editable-text/EditableTextReadOnly";
import { publicApiClient } from "@/shared/api/publicApiClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "For VGS-elever",
  description:
    "Er du videregående-elev? Finn dine kontaktelever og når utdeling og innsamling skjer.",
};

export default async function PupilsPage() {
  const dataKey = "vgs_elever";
  const cachedData = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();

  return (
    <EditableTextReadOnly dataKey={dataKey} cachedText={cachedData.text} />
  );
}
