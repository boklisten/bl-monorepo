import { Metadata } from "next";

import Editor from "@/components/info/Editor";
import { editorData } from "@/utils/mockData";

export const metadata: Metadata = {
  title: "Om oss",
  description:
    "Boklisten har mange års erfaring med kjøp og salg av pensumbøker. Les om vår historie, hvem vi er, og hva vi tilbyr.",
};

const AboutPage = () => {
  return <Editor rawEditorState={editorData.about} />;
};

export default AboutPage;
