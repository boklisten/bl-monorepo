import DynamicNav from "@frontend/components/info/DynamicNav";
import DynamicSubNav from "@frontend/components/info/DynamicSubNav";
import Editor from "@frontend/components/info/Editor";
import {
  infoPageTabs,
  termsAndConditionsTabs,
} from "@frontend/utils/constants";
import { editorData } from "@frontend/utils/mockData";
import { Card } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Betingelser",
  description:
    "Vi tar kundene våre på alvor. Derfor har vi laget detaljerte betingelser, slik at du vet hva som gjelder for din ordre.",
};

const ConditionsPage = () => {
  return (
    <>
      <Card sx={{ paddingBottom: 4 }}>
        <DynamicNav tabs={infoPageTabs} twoRows />
        <DynamicSubNav tabs={termsAndConditionsTabs} />
        <Editor rawEditorState={editorData.conditions} />
      </Card>
    </>
  );
};

export default ConditionsPage;
