import Editor from "@frontend/components/info/Editor";
import { editorData } from "@frontend/utils/mockData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vilkår",
  description:
    "Når du handler hos oss gjelder noen vilkår. Disse er her for å gi alle parter trygghet for hvilke regler som gjelder.",
};

const TermsPage = () => {
  return <Editor rawEditorState={editorData.terms} />;
};

export default TermsPage;
