import { Card } from "@mui/material";
import { Metadata } from "next";

import DynamicNav from "@/components/info/DynamicNav";
import Editor from "@/components/info/Editor";
import { infoPageTabs } from "@/utils/constants";
import { editorData } from "@/utils/mockData";

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
