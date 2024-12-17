import { ToSchema } from "@backend/helper/typescript-helpers";
import { PendingPasswordReset } from "@shared/password-reset/pending-password-reset";
import { Schema } from "mongoose";

export const pendingPasswordResetSchema = new Schema<
  ToSchema<PendingPasswordReset>
>({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
});
