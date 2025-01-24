import { BlModel } from "@backend/lib/storage/bl-storage.js";
import { Delivery } from "@shared/delivery/delivery.js";
import { Schema } from "mongoose";

export const DeliveryModel: BlModel<Delivery> = {
  name: "deliveries",
  schema: new Schema({
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
  }),
};
