import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";
import { BranchModel } from "#services/storage/models/branch.model";
import { ItemModel } from "#services/storage/models/item.model";
import { WaitingListEntry } from "#shared/waiting-list/waiting-list-entry";

export const WaitingListEntriesModel: BlModel<WaitingListEntry> = {
  name: "waiting_list_entries",
  schema: new Schema({
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
      ref: ItemModel.name,
    },
    branchId: {
      type: Schema.ObjectId,
      required: true,
      ref: BranchModel.name,
    },
  }),
};
