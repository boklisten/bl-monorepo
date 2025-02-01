import { Schema } from "mongoose";

import { EmailValidation } from "#services/collections/email-validation/email-validation";
import { BlModel } from "#services/storage/bl-storage";

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
