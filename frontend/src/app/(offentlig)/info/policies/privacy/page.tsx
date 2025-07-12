import { Metadata } from "next";

import EditableTextReadOnly from "@/components/info/editable-text/EditableTextReadOnly";

export const metadata: Metadata = {
  title: "Personvernavtale",
  description:
    "Vi tar personvern på alvor. Derfor har vi laget et dokument som viser en oversikt over hvordan din data bir behandlet hos oss.",
};

const PrivacyPage = () => {
  return <EditableTextReadOnly dataKey={"personvernavtale"} />;
};

export default PrivacyPage;
