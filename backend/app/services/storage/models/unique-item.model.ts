import { UniqueItem } from "@shared/unique-item/unique-item.js";
import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";

export const UniqueItemModel: BlModel<UniqueItem> = {
  name: "uniqueitems",
  schema: new Schema({
    blid: {
      type: String,
      required: true,
    },
    item: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  }),
};
