import { BlModelName, BlModel } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { Schema } from "mongoose";

export const UniqueItemModel: BlModel<UniqueItem> = {
  name: BlModelName.UniqueItems,
  schema: new Schema<ToSchema<UniqueItem>>({
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
