import { LocalLogin } from "@backend/collections/local-login/local-login";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { Schema } from "mongoose";

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
