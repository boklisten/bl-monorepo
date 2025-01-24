import { BlModel } from "@backend/lib/storage/bl-storage.js";
import { Item } from "@shared/item/item.js";
import { Schema } from "mongoose";

export const ItemModel: BlModel<Item> = {
  name: "items",
  schema: new Schema({
    title: {
      type: String,
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
  }),
};
