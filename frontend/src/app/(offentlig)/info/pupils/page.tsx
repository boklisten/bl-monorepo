import { Metadata } from "next";

import EditableTextReadOnly from "@/shared/components/EditableTextReadOnly";
import { publicApiClient } from "@/shared/utils/publicApiClient";

export const metadata: Metadata = {
  title: "For VGS-elever",
  description:
    "Er du videregående-elev? Finn dine kontaktelever og når utdeling og innsamling skjer.",
};

export default async function PupilsPage() {
  "use cache";
  const dataKey = "vgs_elever";
  const cachedData = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();

  return (
    <EditableTextReadOnly dataKey={dataKey} cachedText={cachedData.text} />
  );
}
