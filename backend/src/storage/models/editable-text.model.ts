import { BlModel } from "@backend/storage/bl-storage";
import { EditableText } from "@shared/editable-text/editable-text";
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
