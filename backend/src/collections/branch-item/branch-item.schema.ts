import { BranchItem } from "@boklisten/bl-model";
import { Schema } from "mongoose";

import { ToSchema } from "@/helper/typescript-helpers";

export const branchItemSchema = new Schema<ToSchema<BranchItem>>({
  branch: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  item: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  rent: {
    type: Boolean,
    default: false,
  },
  partlyPayment: {
    type: Boolean,
    default: false,
  },
  buy: {
    type: Boolean,
    default: false,
  },
  sell: {
    type: Boolean,
    default: false,
  },
  live: {
    type: Boolean,
    default: false,
  },

  rentAtBranch: {
    type: Boolean,
    default: false,
  },
  partlyPaymentAtBranch: {
    type: Boolean,
    default: false,
  },
  buyAtBranch: {
    type: Boolean,
    default: false,
  },
  sellAtBranch: {
    type: Boolean,
    default: false,
  },
  liveAtBranch: {
    type: Boolean,
    default: false,
  },

  sharedItems: [Schema.Types.ObjectId],
  categories: {
    type: [String],
    default: [],
  },
});
