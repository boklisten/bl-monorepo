import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage/bl-storage";
import { UniqueItem } from "#shared/unique-item/unique-item";

export const UniqueItemSchema: BlSchema<UniqueItem> = new Schema({
  blid: {
    type: String,
    required: true,
    index: {
      unique: true,
      name: "blid_unique",
    },
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: BlSchemaName.Items,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});
