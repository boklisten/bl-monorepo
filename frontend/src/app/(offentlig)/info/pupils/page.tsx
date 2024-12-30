import Editor from "@frontend/components/info/Editor";
import { editorData } from "@frontend/utils/mockData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "For VGS-elever",
  description:
    "Er du videregående-elev? Finn dine kontaktelever og når utdeling og innsamling skjer.",
};

const Page = () => {
  return <Editor rawEditorState={editorData.pupils} />;
};

export default Page;
