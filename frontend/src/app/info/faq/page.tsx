import { Card } from "@mui/material";
import { Metadata } from "next";

import DynamicNav from "@/components/info/DynamicNav";
import EditableQNA from "@/components/info/EditableQna";
import { infoPageTabs } from "@/utils/constants";
import { QNAs } from "@/utils/mockData";

export const metadata: Metadata = {
  title: "Spørsmål og svar",
  description:
    "Hva betyr det at Boklisten alltid leverer riktig bok? Hvordan bestiller jeg bøker som privatist?",
};

const FaqPage = () => {
  return (
    <>
      <Card sx={{ paddingBottom: 4 }}>
        <DynamicNav tabs={infoPageTabs} twoRows />
        <EditableQNA QNAs={QNAs} />
      </Card>
    </>
  );
};

export default FaqPage;
