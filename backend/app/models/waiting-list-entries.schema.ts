import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage/bl-storage";
import { WaitingListEntry } from "#shared/waiting-list/waiting-list-entry";

export const WaitingListEntriesSchema: BlSchema<WaitingListEntry> = new Schema({
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  itemId: {
    type: Schema.ObjectId,
    required: true,
    ref: BlSchemaName.Items,
  },
  branchId: {
    type: Schema.ObjectId,
    required: true,
    ref: BlSchemaName.Branches,
  },
});
