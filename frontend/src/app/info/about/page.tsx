import DynamicNav from "@frontend/components/info/DynamicNav";
import Editor from "@frontend/components/info/Editor";
import { infoPageTabs } from "@frontend/utils/constants";
import { editorData } from "@frontend/utils/mockData";
import { Card } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Om oss",
  description:
    "Boklisten har mange års erfaring med kjøp og salg av pensumbøker. Les om vår historie, hvem vi er, og hva vi tilbyr.",
};

const AboutPage = () => {
  return (
    <>
      <Card sx={{ paddingBottom: 4 }}>
        <DynamicNav tabs={infoPageTabs} twoRows />
        <Editor rawEditorState={editorData.about} />
      </Card>
    </>
  );
};

export default AboutPage;
