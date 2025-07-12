import { Metadata } from "next";

import EditableTextReadOnly from "@/components/info/editable-text/EditableTextReadOnly";

export const metadata: Metadata = {
  title: "Vilkår",
  description:
    "Når du handler hos oss gjelder noen vilkår. Disse er her for å gi alle parter trygghet for hvilke regler som gjelder.",
};

const TermsPage = () => {
  return <EditableTextReadOnly dataKey={"vilkaar"} />;
};

export default TermsPage;
