import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";
import { User } from "#services/types/user";

export const UserModel: BlModel<User> = {
  name: "users",
  schema: new Schema({
    userDetail: Schema.Types.ObjectId,
    permission: {
      type: String,
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
      required: true,
    },
    valid: {
      type: Boolean,
      default: true,
    },
    primary: {
      type: Boolean,
    },
    movedToPrimary: Schema.Types.ObjectId,
  }),
};
