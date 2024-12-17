import { UniqueItem } from "@boklisten/bl-model";
import { Schema } from "mongoose";

import { ToSchema } from "@/helper/typescript-helpers";

export const uniqueItemSchema = new Schema<ToSchema<UniqueItem>>({
  blid: {
    type: String,
    required: true,
  },
  item: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  location: String,
  actions: [Schema.Types.Mixed],
});
