import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage/bl-storage";
import { User } from "#services/types/user";

export const UserSchema: BlSchema<User> = new Schema({
  userDetail: {
    type: Schema.Types.ObjectId,
    ref: BlSchemaName.UserDetails,
    index: {
      unique: true,
      name: "user_detail_unique",
    },
  },
  permission: {
    type: String,
    trim: true,
    lowercase: true,
    enum: ["customer", "employee", "manager", "admin"],
    required: true,
  },
  login: {
    type: {
      provider: {
        type: String,
        required: true,
      },
      providerId: {
        type: String,
        required: true,
      },
    },
    required: true,
  },
  blid: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    index: {
      unique: true,
      name: "username_unique",
    },
  },
  valid: {
    type: Boolean,
    default: true,
  },
  primary: {
    type: Boolean,
  },
  movedToPrimary: { type: Schema.Types.ObjectId, ref: BlSchemaName.Users }, // fixme: remove this when the username_unique constraint is enforced
});
