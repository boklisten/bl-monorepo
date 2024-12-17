import { ToSchema } from "@backend/helper/typescript-helpers";
import { Delivery } from "@shared/delivery/delivery";
import { Schema } from "mongoose";

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
