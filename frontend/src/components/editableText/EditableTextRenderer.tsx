import "react-quill/dist/quill.core.css";

import { sanitizeQuillHtml } from "@frontend/utils/sanitizeHtml";
import { MaybeEmptyEditableText } from "@frontend/utils/types";
import { Box } from "@mui/material";

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
