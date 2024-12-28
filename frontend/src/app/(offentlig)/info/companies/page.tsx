import DynamicNav from "@frontend/components/info/DynamicNav";
import Editor from "@frontend/components/info/Editor";
import { infoPageTabs } from "@frontend/utils/constants";
import { editorData } from "@frontend/utils/mockData";
import { Card } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "For skolekunder",
  description:
    "Er du ansvarlig for en videregående eller privatist-skole? Vi tilbyr en rekke nyttige tjenester til dere! Les om våre tilbud til skoler, hvordan utlånsordningen fungrer og hvordan dere kan kjøpe bøker fra skyvearkivet.",
};

const Page = () => {
  return (
    <>
      <Card sx={{ paddingBottom: 4 }}>
        <DynamicNav tabs={infoPageTabs} twoRows />
        <Editor rawEditorState={editorData.companies} />
      </Card>
    </>
  );
};

export default Page;
