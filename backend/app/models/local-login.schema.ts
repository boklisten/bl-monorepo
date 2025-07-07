import { Schema } from "mongoose";

import { BlSchema } from "#services/storage/bl-storage";
import { LocalLogin } from "#services/types/local-login";

export const LocalLoginSchema: BlSchema<LocalLogin> = new Schema({
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
  hashedPassword: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
});
