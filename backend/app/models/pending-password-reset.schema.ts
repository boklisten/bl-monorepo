import { Schema } from "mongoose";

import { BlSchema } from "#services/storage/bl-storage";
import { PendingPasswordReset } from "#shared/password-reset/pending-password-reset";

export const PendingPasswordResetSchema: BlSchema<PendingPasswordReset> =
  new Schema({
    email: {
      type: Schema.Types.String,
      trim: true,
      lowercase: true,
      required: true,
    },
    tokenHash: {
      type: Schema.Types.String,
      required: true,
    },
    creationTime: {
      type: Date,
      index: {
        name: "expire_after",
        expires: 60 * 20,
      },
    },
  });
