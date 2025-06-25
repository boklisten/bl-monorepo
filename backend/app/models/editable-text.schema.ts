import { Schema } from "mongoose";

import { BlSchema } from "#services/storage/bl-storage";
import { EditableText } from "#shared/editable-text/editable-text";

export const EditableTextSchema: BlSchema<EditableText> = new Schema({
  text: {
    type: String,
    required: true,
  },
});
