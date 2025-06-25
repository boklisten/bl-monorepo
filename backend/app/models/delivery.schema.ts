import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage/bl-storage";
import { Delivery } from "#shared/delivery/delivery";

export const DeliverySchema: BlSchema<Delivery> = new Schema({
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
    ref: BlSchemaName.Orders,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});
