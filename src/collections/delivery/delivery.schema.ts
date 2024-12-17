import { Delivery } from "@boklisten/bl-model";
import { Schema } from "mongoose";

import { ToSchema } from "@/helper/typescript-helpers";

export const deliverySchema = new Schema<ToSchema<Delivery>>({
  method: {
    type: String,
    required: true,
  },
  info: {
    type: Schema.Types.Mixed,
    required: true,
  },
  order: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});
