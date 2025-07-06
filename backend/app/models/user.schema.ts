import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage/bl-storage";
import { User } from "#services/types/user";

const LoginSchema = new Schema(
  {
    google: {
      type: { userId: { type: String, required: true } },
      required: false,
      _id: false,
    },
    facebook: {
      type: { userId: { type: String, required: true } },
      required: false,
      _id: false,
    },
    /**
     * fixme: add this when we migrate the local login table to users
    local: {
      type: {
        hashedPassword: { type: String, required: true },
        salt: { type: String, required: true },
      },
      required: false,
     _id: false,
    },
    */
  },
  { _id: false },
);

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
  login: { type: LoginSchema, required: true },
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
});
