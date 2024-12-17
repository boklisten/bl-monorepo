import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { isAdmin } from "@/api/auth";
import { EditableTextEditor } from "@/components/editableText/EditableTextEditor";
import { EditableTextRenderer } from "@/components/editableText/EditableTextRenderer";
import { MaybeEmptyEditableText } from "@/utils/types";
import useIsHydrated from "@/utils/useIsHydrated";

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
