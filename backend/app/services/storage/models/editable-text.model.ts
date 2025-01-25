import { EditableText } from "@shared/editable-text/editable-text.js";
import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";

export const EditableTextModel: BlModel<EditableText> = {
  name: "editabletexts",
  schema: new Schema({
    text: {
      type: String,
      required: true,
    },
  }),
};
