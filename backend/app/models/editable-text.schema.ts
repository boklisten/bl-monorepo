import { Schema } from "mongoose";

import { BlSchema } from "#services/storage/bl-storage";
import { EditableText } from "#shared/editable-text";

export const EditableTextSchema: BlSchema<EditableText> = new Schema({
  key: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    immutable: true,
    index: {
      unique: true,
      name: "key_unique",
    },
  },
  text: {
    type: String,
    required: true,
  },
});
