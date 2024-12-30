import Editor from "@frontend/components/info/Editor";
import { editorData } from "@frontend/utils/mockData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generell informasjon",
  description:
    "Velkommen til Boklisten.no! Her kan du enkelt kjøpe pensumbøker. Les om vårt konsept, og hvilke tjenester vi tilbyr her.",
};

const Page = () => {
  return <Editor rawEditorState={editorData.general} />;
};

export default Page;
