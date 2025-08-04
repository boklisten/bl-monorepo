import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
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
    required: false,
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
  info: {
    type: Schema.Types.Mixed,
    required: false,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  discount: {
    type: {
      amount: {
        type: Number,
        required: true,
      },
      coupon: String,
    },
    required: false,
  },
});
