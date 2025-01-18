import { BlModel } from "@backend/storage/bl-storage";
import { PendingPasswordReset } from "@shared/password-reset/pending-password-reset";
import { Schema } from "mongoose";

export const PendingPasswordResetModel: BlModel<PendingPasswordReset> = {
  name: "pendingpasswordresets",
  schema: new Schema({
    // @ts-expect-error fixme: auto ignored
    _id: {
      type: Schema.Types.String,
      required: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
    },
    tokenHash: {
      type: Schema.Types.String,
      required: true,
    },
    salt: {
      type: Schema.Types.String,
      required: true,
    },
  }),
};
