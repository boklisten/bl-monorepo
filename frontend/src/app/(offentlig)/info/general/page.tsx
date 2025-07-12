import { Metadata } from "next";

import EditableTextReadOnly from "@/components/info/editable-text/EditableTextReadOnly";

export const metadata: Metadata = {
  title: "Generell informasjon",
  description:
    "Velkommen til Boklisten.no! Her kan du enkelt kjøpe pensumbøker. Les om vårt konsept, og hvilke tjenester vi tilbyr her.",
};

const Page = () => {
  return <EditableTextReadOnly dataKey={"generell_informasjon"} />;
};

export default Page;
