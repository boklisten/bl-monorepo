import { Metadata } from "next";

import Editor from "@/components/info/Editor";
import { editorData } from "@/utils/mockData";

export const metadata: Metadata = {
  title: "For skolekunder",
  description:
    "Er du ansvarlig for en videregående eller privatist-skole? Vi tilbyr en rekke nyttige tjenester til dere! Les om våre tilbud til skoler, hvordan utlånsordningen fungrer og hvordan dere kan kjøpe bøker fra skyvearkivet.",
};

const Page = () => {
  return <Editor rawEditorState={editorData.companies} />;
};

export default Page;
