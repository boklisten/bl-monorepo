import { BlModel } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { BranchItem } from "@shared/branch-item/branch-item";
import { Schema } from "mongoose";

export const BranchItemModel: BlModel<BranchItem> = {
  name: "branchitems",
  schema: new Schema<ToSchema<BranchItem>>({
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

    categories: {
      type: [String],
      default: [],
    },
  }),
};
