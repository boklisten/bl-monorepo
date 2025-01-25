import { Metadata } from "next";

import EditableQNA from "@/components/info/EditableQna";
import { QNAs } from "@/utils/mockData";

export const metadata: Metadata = {
  title: "Spørsmål og svar",
  description:
    "Hva betyr det at Boklisten alltid leverer riktig bok? Hvordan bestiller jeg bøker som privatist?",
};

const FaqPage = () => {
  return <EditableQNA QNAs={QNAs} />;
};

export default FaqPage;
