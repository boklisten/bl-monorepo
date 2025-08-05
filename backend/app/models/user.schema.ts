import { Schema } from "mongoose";

import { BlSchemaName } from "#models/storage/bl-schema-names";
import { BlSchema } from "#services/storage_service";
import { Login, User } from "#types/user";

const LoginSchema = new Schema<Login>(
  {
    vipps: {
      type: {
        userId: { type: String, required: true },
        lastLogin: { type: Date, required: true },
      },
      required: false,
      _id: false,
    },
    local: {
      type: {
        hashedPassword: { type: String, required: true },
        salt: { type: String }, // fixme: Legacy, only used for the old sha256 hashing, remove when most of our hashes have been converted to argon2
        lastLogin: Date,
      },
      required: false,
      _id: false,
    },
    lastTokenIssuedAt: Date,
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
});
