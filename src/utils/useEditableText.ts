import { EditableText } from "@boklisten/bl-model";

import BlFetcher from "@/api/blFetcher";
import BL_CONFIG from "@/utils/bl-config";
import { assertBlApiError, MaybeEmptyEditableText } from "@/utils/types";

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
