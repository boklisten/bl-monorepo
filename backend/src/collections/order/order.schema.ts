import { Order } from "@boklisten/bl-model";
import { Schema } from "mongoose";

import { ToSchema } from "@/helper/typescript-helpers";

export const orderSchema = new Schema<ToSchema<Order>>({
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
        age: {
          type: String,
          required: false,
        },
        item: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        blid: {
          type: String,
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
          required: false,
        },
        movedToOrder: {
          type: Schema.Types.ObjectId,
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
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  byCustomer: {
    type: Boolean,
    required: true,
  },
  employee: {
    type: Schema.Types.ObjectId,
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
