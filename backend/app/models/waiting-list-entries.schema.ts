import { Schema } from "mongoose";

import { BlSchemaName } from "#models/storage/bl-schema-names";
import { BlSchema } from "#services/storage_service";
import { WaitingListEntry } from "#shared/waiting-list-entry";

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
