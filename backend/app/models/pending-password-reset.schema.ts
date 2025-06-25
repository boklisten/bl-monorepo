import { Schema } from "mongoose";

import { BlSchema } from "#services/storage/bl-storage";
import { PendingPasswordReset } from "#shared/password-reset/pending-password-reset";

export const PendingPasswordResetSchema: BlSchema<PendingPasswordReset> =
  new Schema({
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
    creationTime: {
      type: Date,
      index: {
        name: "expire_after",
        expires: 60 * 20,
      },
    },
  });
