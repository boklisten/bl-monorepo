import { Metadata } from "next";

import EditableTextReadOnly from "@/components/info/editable-text/EditableTextReadOnly";

export const metadata: Metadata = {
  title: "For skolekunder",
  description:
    "Er du ansvarlig for en videregående eller privatist-skole? Vi tilbyr en rekke nyttige tjenester til dere! Les om våre tilbud til skoler, hvordan utlånsordningen fungrer og hvordan dere kan kjøpe bøker fra skyvearkivet.",
};

const Page = () => {
  return <EditableTextReadOnly dataKey={"for_skolekunder"} />;
};

export default Page;
