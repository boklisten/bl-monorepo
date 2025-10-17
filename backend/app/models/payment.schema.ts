import { Schema } from "mongoose";

import { BlSchemaName } from "#models/storage/bl-schema-names";
import { BlSchema } from "#services/storage_service";
import { Payment } from "#shared/payment/payment";

export const PaymentSchema: BlSchema<Payment> = new Schema({
  method: {
    type: String,
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
  customer: {
    type: Schema.Types.ObjectId,
    ref: BlSchemaName.UserDetails,
  },
  branch: {
    type: Schema.Types.ObjectId,
    ref: BlSchemaName.Branches,
    required: true,
  },
  taxAmount: {
    type: Number,
    required: true,
  },
  info: Schema.Types.Mixed,
  confirmed: Boolean,
});
