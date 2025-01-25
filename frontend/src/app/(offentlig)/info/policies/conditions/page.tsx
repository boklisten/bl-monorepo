import { Metadata } from "next";

import Editor from "@/components/info/Editor";
import { editorData } from "@/utils/mockData";

export const metadata: Metadata = {
  title: "Betingelser",
  description:
    "Vi tar kundene våre på alvor. Derfor har vi laget detaljerte betingelser, slik at du vet hva som gjelder for din ordre.",
};

const ConditionsPage = () => {
  return <Editor rawEditorState={editorData.conditions} />;
};

export default ConditionsPage;
