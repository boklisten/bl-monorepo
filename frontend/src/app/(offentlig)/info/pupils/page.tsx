import { Metadata } from "next";

import EditableTextReadOnly from "@/components/info/editable-text/EditableTextReadOnly";

export const metadata: Metadata = {
  title: "For VGS-elever",
  description:
    "Er du videregående-elev? Finn dine kontaktelever og når utdeling og innsamling skjer.",
};

const Page = () => {
  return <EditableTextReadOnly dataKey={"vgs_elever"} />;
};

export default Page;
