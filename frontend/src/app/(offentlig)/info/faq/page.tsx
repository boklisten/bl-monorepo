import DynamicNav from "@frontend/components/info/DynamicNav";
import EditableQNA from "@frontend/components/info/EditableQna";
import { infoPageTabs } from "@frontend/utils/constants";
import { QNAs } from "@frontend/utils/mockData";
import { Card } from "@mui/material";
import { Metadata } from "next";

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
