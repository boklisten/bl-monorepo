import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";
import { Branch } from "#shared/branch/branch";

export const BranchModel: BlModel<Branch> = {
  name: "branches",
  schema: new Schema({
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    parentBranch: Schema.Types.ObjectId,
    localName: String,
    childBranches: [Schema.Types.ObjectId],
    paymentInfo: {
      responsible: {
        type: Boolean,
        default: false,
        required: true,
      },
      responsibleForDelivery: Boolean,
      partlyPaymentPeriods: {
        type: [
          {
            type: {
              // Important: keep this nesting ("type" is reserved by mongoose)
              type: String,
            },
            date: Date,
            percentageBuyout: Number,
            percentageBuyoutUsed: Number,
            percentageUpFront: Number,
            percentageUpFrontUsed: Number,
          },
        ],
        default: [],
      },
      rentPeriods: {
        type: [
          {
            type: {
              // Important: keep this nesting ("type" is reserved by mongoose)
              type: String,
            },
            maxNumberOfPeriods: Number,
            date: Date,
            percentage: Number,
          },
        ],
        default: [],
      },
      extendPeriods: {
        type: [
          {
            type: {
              // Important: keep this nesting ("type" is reserved by mongoose)
              type: String,
            },
            maxNumberOfPeriods: Number,
            date: Date,
            percentage: Number,
            price: Number,
          },
        ],
        default: [],
      },
      buyout: {
        percentage: {
          type: Number,
          default: 1,
        },
      },
      sell: {
        percentage: {
          type: Number,
          default: 1,
        },
      },
      payLater: Boolean,
    },
    deliveryMethods: {
      branch: {
        type: Boolean,
        default: true,
      },
      byMail: {
        type: Boolean,
        default: true,
      },
    },
    isBranchItemsLive: {
      online: Boolean,
      atBranch: Boolean,
    },
    branchItems: [Schema.Types.ObjectId],
    openingHours: [Schema.Types.ObjectId],
    location: {
      region: String,
      address: String,
    },
  }),
};
