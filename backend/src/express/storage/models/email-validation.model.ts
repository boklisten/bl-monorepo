import { EmailValidation } from "@backend/express/collections/email-validation/email-validation.js";
import { BlModel } from "@backend/express/storage/bl-storage.js";
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
