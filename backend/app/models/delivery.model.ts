import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";
import { Delivery } from "#shared/delivery/delivery";

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
