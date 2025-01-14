import { BlModelName, BlModel } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { Branch } from "@shared/branch/branch";
import { Schema } from "mongoose";

export const BranchModel: BlModel<Branch> = {
  name: BlModelName.Branches,
  schema: new Schema<ToSchema<Branch>>({
    name: {
      type: String,
      required: true,
    },
    type: String,
    desc: String,
    root: Boolean,
    viewableFor: [String],
    contactInfo: {
      phone: String,
      email: String,
      address: String,
      postCode: String,
      postCity: String,
      country: String,
      locationDesc: String,
      location: {
        type: {
          latitude: {
            type: String,
            required: true,
          },
          longitude: {
            type: String,
            required: true,
          },
        },
      },
    },
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
    location: Schema.Types.Mixed,
  }),
};
