import { BlModel } from "@backend/lib/storage/bl-storage.js";
import { EditableText } from "@shared/editable-text/editable-text.js";
import { Schema } from "mongoose";

export const EditableTextModel: BlModel<EditableText> = {
  name: "editabletexts",
  schema: new Schema({
    text: {
      type: String,
      required: true,
    },
  }),
};
