import { Schema } from "mongoose";

import { LocalLogin } from "@/collections/local-login/local-login";
import { ToSchema } from "@/helper/typescript-helpers";

export const localLoginSchema = new Schema<ToSchema<LocalLogin>>({
  username: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  providerId: {
    type: String,
    required: true,
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
