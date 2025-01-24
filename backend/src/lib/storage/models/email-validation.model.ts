import { EmailValidation } from "@backend/lib/collections/email-validation/email-validation.js";
import { BlModel } from "@backend/lib/storage/bl-storage.js";
import { Schema } from "mongoose";

export const EmailValidationModel: BlModel<EmailValidation> = {
  name: "email_validations",
  schema: new Schema({
    email: {
      type: String,
      required: true,
    },
    userDetail: Schema.Types.ObjectId,
  }),
};
