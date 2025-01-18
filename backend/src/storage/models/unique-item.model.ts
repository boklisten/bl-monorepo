import { BlModel } from "@backend/storage/bl-storage";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { Schema } from "mongoose";

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
