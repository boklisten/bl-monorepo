import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage/bl-storage";
import { Order } from "#shared/order/order";

export const OrderSchema: BlSchema<Order> = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  orderItems: {
    type: [
      {
        type: {
          // Important: keep this nesting ("type" is reserved by mongoose)
          type: String,
          required: true,
        },
        item: {
          type: Schema.Types.ObjectId,
          ref: BlSchemaName.Items,
          required: true,
        },
        blid: {
          type: String,
          trim: true,
        },
        title: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        delivered: {
          type: Boolean,
          required: false,
          default: false,
        },
        taxRate: {
          type: Number,
          required: true,
        },
        taxAmount: {
          type: Number,
          required: true,
        },
        customerItem: {
          type: Schema.Types.ObjectId,
          ref: BlSchemaName.CustomerItems,
          required: false,
        },
        info: {
          type: Schema.Types.Mixed,
          required: false,
        },
        handout: {
          type: Boolean,
          required: false,
        },
        movedFromOrder: {
          type: Schema.Types.ObjectId,
          ref: BlSchemaName.Orders,
          required: false,
        },
        movedToOrder: {
          type: Schema.Types.ObjectId,
          ref: BlSchemaName.Orders,
          required: false,
        },
        discount: {
          type: {
            amount: {
              type: Number,
              required: true,
            },
            coupon: {
              type: String,
              required: true,
            },
          },
          required: false,
        },
      },
    ],
    default: [],
  },
  branch: {
    type: Schema.Types.ObjectId,
    ref: BlSchemaName.Branches,
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: BlSchemaName.UserDetails,
    required: true,
  },
  byCustomer: {
    type: Boolean,
    required: true,
  },
  employee: {
    type: Schema.Types.ObjectId,
    ref: BlSchemaName.UserDetails,
  },
  placed: {
    type: Boolean,
    default: false,
  },
  payments: {
    type: [String],
    default: [],
  },
  delivery: {
    type: Schema.Types.ObjectId,
    ref: BlSchemaName.Deliveries,
  },
  handoutByDelivery: {
    type: Boolean,
    required: false,
  },
  notification: {
    type: Schema.Types.Mixed,
    required: false,
  },
  pendingSignature: {
    type: Boolean,
    required: true,
  },
});
