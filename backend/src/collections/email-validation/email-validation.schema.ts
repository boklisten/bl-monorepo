import { EmailValidation } from "@backend/collections/email-validation/email-validation";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { Schema } from "mongoose";

export const emailValidationSchema = new Schema<ToSchema<EmailValidation>>({
  email: {
    type: String,
    required: true,
  },
  userDetail: Schema.Types.ObjectId,
});
