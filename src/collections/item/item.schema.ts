import { Item } from "@boklisten/bl-model";
import { Schema } from "mongoose";

import { ToSchema } from "@/helper/typescript-helpers";

export const itemSchema = new Schema<ToSchema<Item>>({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  digital: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    required: true,
  },
  taxRate: {
    type: Number,
    required: true,
  },
  info: {
    type: {
      isbn: {
        type: Number,
        required: true,
      },
      subject: {
        type: String,
        required: true,
      },
      year: {
        type: Number,
        required: true,
      },
      price: {
        type: Map,
        of: Number,
        required: true,
      },
      weight: {
        type: String,
        required: true,
      },
      distributor: {
        type: String,
        required: true,
      },
      discount: {
        type: Number,
        required: true,
      },
      publisher: {
        type: String,
        required: true,
      },
    },
    required: true,
  },
  buyback: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: [String],
    default: [],
  },
});
