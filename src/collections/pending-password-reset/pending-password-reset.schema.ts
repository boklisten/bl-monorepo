import { PendingPasswordReset } from "@boklisten/bl-model";
import { Schema } from "mongoose";

import { ToSchema } from "@/helper/typescript-helpers";

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
