import { LocalLogin } from "@backend/collections/local-login/local-login";
import { BlModel } from "@backend/storage/bl-storage";
import { Schema } from "mongoose";

export const LocalLoginModel: BlModel<LocalLogin> = {
  name: "locallogins",
  schema: new Schema({
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
  }),
};
