import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { isAdmin } from "@frontend/api/auth";
import { EditableTextEditor } from "@frontend/components/editableText/EditableTextEditor";
import { EditableTextRenderer } from "@frontend/components/editableText/EditableTextRenderer";
import { MaybeEmptyEditableText } from "@frontend/utils/types";
import useIsHydrated from "@frontend/utils/useIsHydrated";

export interface EditorProps {
  editableText: MaybeEmptyEditableText;
}

const EditableTextElement = ({ editableText }: EditorProps) => {
  const hydrated = useIsHydrated();

  if (hydrated && isAdmin()) {
    return <EditableTextEditor editableText={editableText} />;
  }

  return <EditableTextRenderer editableText={editableText} />;
};

export default EditableTextElement;
