import { EditableText } from "@boklisten/bl-model";
import { Schema } from "mongoose";

import { ToSchema } from "@/helper/typescript-helpers";

export const editableTextSchema = new Schema<ToSchema<EditableText>>({
  text: {
    type: String,
    required: true,
  },
});
