import { Schema } from "mongoose";

import { BlSchema } from "#services/storage/bl-storage";
import { Item } from "#shared/item/item";

export const ItemSchema: BlSchema<Item> = new Schema({
  title: {
    type: String,
    trim: true,
    required: true,
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
        index: {
          unique: true,
          name: "isbn_unique",
        },
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
});
