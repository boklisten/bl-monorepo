import EditableQNA from "@frontend/components/info/EditableQna";
import { QNAs } from "@frontend/utils/mockData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spørsmål og svar",
  description:
    "Hva betyr det at Boklisten alltid leverer riktig bok? Hvordan bestiller jeg bøker som privatist?",
};

const FaqPage = () => {
  return <EditableQNA QNAs={QNAs} />;
};

export default FaqPage;
