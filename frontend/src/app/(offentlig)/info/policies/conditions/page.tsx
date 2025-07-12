import { Metadata } from "next";

import EditableTextReadOnly from "@/components/info/editable-text/EditableTextReadOnly";

export const metadata: Metadata = {
  title: "Betingelser",
  description:
    "Vi tar kundene våre på alvor. Derfor har vi laget detaljerte betingelser, slik at du vet hva som gjelder for din ordre.",
};

const ConditionsPage = () => {
  return <EditableTextReadOnly dataKey={"betingelser"} />;
};

export default ConditionsPage;
