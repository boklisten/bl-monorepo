import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";
import { LocalLogin } from "#services/types/local-login";

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
