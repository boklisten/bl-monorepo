import { BlModel, BlModelName } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { Item } from "@shared/item/item";
import { Schema } from "mongoose";

export const ItemModel: BlModel<Item> = {
  name: BlModelName.Items,
  schema: new Schema<ToSchema<Item>>({
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
