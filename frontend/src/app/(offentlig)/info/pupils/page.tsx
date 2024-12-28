import DynamicNav from "@frontend/components/info/DynamicNav";
import Editor from "@frontend/components/info/Editor";
import { infoPageTabs } from "@frontend/utils/constants";
import { editorData } from "@frontend/utils/mockData";
import { Card } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "For VGS-elever",
  description:
    "Er du videregående-elev? Finn dine kontaktelever og når utdeling og innsamling skjer.",
};

const Page = () => {
  return (
    <>
      <Card sx={{ paddingBottom: 4 }}>
        <DynamicNav tabs={infoPageTabs} twoRows />
        <Editor rawEditorState={editorData.pupils} />
      </Card>
    </>
  );
};

export default Page;
