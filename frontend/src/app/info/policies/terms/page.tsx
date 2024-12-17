import DynamicNav from "@frontend/components/info/DynamicNav";
import DynamicSubNav from "@frontend/components/info/DynamicSubNav";
import Editor from "@frontend/components/info/Editor";
import {
  infoPageTabs,
  termsAndConditionsTabs,
} from "@frontend/utils/constants";
import { editorData } from "@frontend/utils/mockData";
import { Card } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vilkår",
  description:
    "Når du handler hos oss gjelder noen vilkår. Disse er her for å gi alle parter trygghet for hvilke regler som gjelder.",
};

const TermsPage = () => {
  return (
    <>
      <Card sx={{ paddingBottom: 4 }}>
        <DynamicNav tabs={infoPageTabs} twoRows />
        <DynamicSubNav tabs={termsAndConditionsTabs} />
        <Editor rawEditorState={editorData.terms} />
      </Card>
    </>
  );
};

export default TermsPage;
