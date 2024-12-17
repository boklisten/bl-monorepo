import { Card } from "@mui/material";
import { Metadata } from "next";

import DynamicNav from "@/components/info/DynamicNav";
import DynamicSubNav from "@/components/info/DynamicSubNav";
import Editor from "@/components/info/Editor";
import { infoPageTabs, termsAndConditionsTabs } from "@/utils/constants";
import { editorData } from "@/utils/mockData";

export const metadata: Metadata = {
  title: "Personvernavtale",
  description:
    "Vi tar personvern på alvor. Derfor har vi laget et dokument som viser en oversikt over hvordan din data bir behandlet hos oss.",
};

const PrivacyPage = () => {
  return (
    <>
      <Card sx={{ paddingBottom: 4 }}>
        <DynamicNav tabs={infoPageTabs} twoRows />
        <DynamicSubNav tabs={termsAndConditionsTabs} />
        <Editor rawEditorState={editorData.privacy} />
      </Card>
    </>
  );
};

export default PrivacyPage;
