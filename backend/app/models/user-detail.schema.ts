import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage/bl-storage";
import { UserDetail } from "#shared/user/user-detail/user-detail";

export const UserDetailSchema: BlSchema<UserDetail> = new Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    index: {
      unique: true,
      name: "email_unique",
    },
  },
  phone: {
    type: String,
    trim: true,
    index: {
      unique: true,
      sparse: true,
      name: "phone_unique",
    },
  },
  address: {
    type: String,
    trim: true,
  },
  postCode: {
    type: String,
    trim: true,
  },
  postCity: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
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
    ref: BlSchemaName.Branches,
  },
  guardian: {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    emailConfirmed: {
      type: Boolean,
    },
    phone: {
      type: String,
      trim: true,
    },
    confirmed: {
      type: Boolean,
    },
  },
  customerItems: [
    { type: Schema.Types.ObjectId, ref: BlSchemaName.CustomerItems },
  ],
  orders: [{ type: Schema.Types.ObjectId, ref: BlSchemaName.Orders }],
  signatures: [{ type: Schema.Types.ObjectId, ref: BlSchemaName.Signatures }],
  blid: {
    type: String,
    required: true,
  },
  branchMembership: {
    type: Schema.Types.ObjectId,
    ref: BlSchemaName.Branches,
  },
});
