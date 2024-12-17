import BlFetcher from "@frontend/api/blFetcher";
import BL_CONFIG from "@frontend/utils/bl-config";
import {
  assertBlApiError,
  MaybeEmptyEditableText,
} from "@frontend/utils/types";
import { EditableText } from "@shared/editable-text/editable-text";

const useEditableText = async (
  editableTextId: string,
): Promise<MaybeEmptyEditableText> => {
  try {
    const [result] = await BlFetcher.get<[EditableText]>(
      `${BL_CONFIG.collection.editableText}/${editableTextId}`,
    );
    return result;
  } catch (error) {
    assertBlApiError(error);
    return {
      id: editableTextId,
      text: null,
    };
  }
};

export default useEditableText;
