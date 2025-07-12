import { Metadata } from "next";

import EditableTextReadOnly from "@/components/info/editable-text/EditableTextReadOnly";

export const metadata: Metadata = {
  title: "Om oss",
  description:
    "Boklisten har mange års erfaring med kjøp og salg av pensumbøker. Les om vår historie, hvem vi er, og hva vi tilbyr.",
};

const AboutPage = () => {
  return <EditableTextReadOnly dataKey={"om_oss"} />;
};

export default AboutPage;
