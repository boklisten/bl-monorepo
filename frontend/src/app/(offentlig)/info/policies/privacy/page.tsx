import Editor from "@frontend/components/info/Editor";
import { editorData } from "@frontend/utils/mockData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personvernavtale",
  description:
    "Vi tar personvern på alvor. Derfor har vi laget et dokument som viser en oversikt over hvordan din data bir behandlet hos oss.",
};

const PrivacyPage = () => {
  return <Editor rawEditorState={editorData.privacy} />;
};

export default PrivacyPage;
