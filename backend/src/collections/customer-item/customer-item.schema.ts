import { ToSchema } from "@backend/helper/typescript-helpers";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Schema } from "mongoose";

export const customerItemSchema = new Schema<ToSchema<CustomerItem>>({
  item: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
  },
  blid: String,
  customer: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  match: {
    type: Boolean,
    default: false,
  }, // TODO: delete?
  matchInfo: {
    id: Schema.Types.ObjectId,
    time: Date,
  }, // TODO: delete?
  handout: {
    type: Boolean,
    default: false,
  },
  handoutInfo: {
    handoutBy: {
      type: String,
      required: true,
    },
    handoutById: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    handoutEmployee: Schema.Types.ObjectId,
    time: Date,
  },
  returned: {
    type: Boolean,
    required: true,
  },
  returnInfo: {
    returnedTo: String,
    returnedToId: Schema.Types.ObjectId,
    returnEmployee: Schema.Types.ObjectId,
    time: Date,
  },
  cancel: {
    type: Boolean,
    default: false,
  },
  cancelInfo: {
    order: Schema.Types.ObjectId,
    time: Date,
  },
  buyout: {
    type: Boolean,
    default: false,
  },
  buyoutInfo: {
    order: Schema.Types.ObjectId,
    time: Date,
  },
  buyback: {
    type: Boolean,
    default: false,
  },
  buybackInfo: {
    order: Schema.Types.ObjectId,
  },

  orders: [Schema.Types.ObjectId],
  periodExtends: {
    type: [
      {
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: Date,
          required: true,
        },
        periodType: {
          type: String,
          required: true,
        },
        time: {
          type: Date,
          required: true,
        },
      },
    ],
    default: [],
  },
  totalAmount: Number,
  amountLeftToPay: Number,
  customerInfo: {
    name: String,
    phone: String,
    address: String,
    postCode: String,
    postCity: String,
    dob: Date,
    guardian: {
      name: String,
      email: String,
      phone: String,
    },
  }, // TODO: this information should not be duped here, customer ref. instead
});
