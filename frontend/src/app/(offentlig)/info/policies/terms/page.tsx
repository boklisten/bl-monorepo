import { Metadata } from "next";

import Editor from "@/components/info/Editor";
import { editorData } from "@/utils/mockData";

export const metadata: Metadata = {
  title: "Vilkår",
  description:
    "Når du handler hos oss gjelder noen vilkår. Disse er her for å gi alle parter trygghet for hvilke regler som gjelder.",
};

const TermsPage = () => {
  return <Editor rawEditorState={editorData.terms} />;
};

export default TermsPage;
