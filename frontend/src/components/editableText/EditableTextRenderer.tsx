import "react-quill/dist/quill.core.css";

import { Box } from "@mui/material";

import { sanitizeQuillHtml } from "@/utils/sanitizeHtml";
import { MaybeEmptyEditableText } from "@/utils/types";

export const EditableTextRenderer = ({
  editableText,
}: {
  editableText: MaybeEmptyEditableText;
}) => {
  if (!editableText.text) {
    return null;
  }
  const content = sanitizeQuillHtml(editableText.text);
  return (
    <Box
      className="ql-editor"
      sx={{
        width: "fit-content",
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
