import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";
import { UserDetail } from "#shared/user/user-detail/user-detail";

export const UserDetailModel: BlModel<UserDetail> = {
  name: "userdetails",
  schema: new Schema({
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    postCode: {
      type: String,
    },
    postCity: {
      type: String,
    },
    country: {
      type: String,
    },
    emailConfirmed: {
      type: Boolean,
      default: false,
    },
    dob: {
      type: Date,
    },
    branch: {
      type: Schema.Types.ObjectId,
    },
    guardian: {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      emailConfirmed: {
        type: Boolean,
      },
      phone: {
        type: String,
      },
      confirmed: {
        type: Boolean,
      },
    },
    customerItems: [Schema.Types.ObjectId],
    orders: [Schema.Types.ObjectId],
    signatures: [Schema.Types.ObjectId],
    blid: {
      type: String,
      required: true,
    },
    temporaryGroupMembership: String, // Temporary field for Ullern Matching January 2024
  }),
};
