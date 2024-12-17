import { ToSchema } from "@backend/helper/typescript-helpers";
import { EditableText } from "@shared/editable-text/editable-text";
import { Schema } from "mongoose";

export const editableTextSchema = new Schema<ToSchema<EditableText>>({
  text: {
    type: String,
    required: true,
  },
});
