import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage/bl-storage";
import { UserDetail } from "#shared/user/user-detail/user-detail";

export const UserDetailSchema: BlSchema<UserDetail> = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    index: {
      unique: true,
      name: "email_unique",
    },
  },
  phone: {
    type: String,
    index: {
      unique: true,
      sparse: true,
      name: "phone_unique",
    },
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
    ref: BlSchemaName.Branches,
  },
  guardian: {
    name: {
      type: String,
    },
    email: {
      type: String,
      index: {
        unique: true,
        sparse: true,
        name: "guardian_email_unique",
      },
    },
    emailConfirmed: {
      type: Boolean,
    },
    phone: {
      type: String,
      index: {
        unique: true,
        sparse: true,
        name: "guardian_phone_unique",
      },
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
