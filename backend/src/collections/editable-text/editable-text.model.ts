import { BlModel } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { EditableText } from "@shared/editable-text/editable-text";
import { Schema } from "mongoose";

export const EditableTextModel: BlModel<EditableText> = {
  name: "editabletexts",
  schema: new Schema<ToSchema<EditableText>>({
    text: {
      type: String,
      required: true,
    },
  }),
};
