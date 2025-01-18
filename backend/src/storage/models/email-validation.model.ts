import { EmailValidation } from "@backend/collections/email-validation/email-validation";
import { BlModel } from "@backend/storage/bl-storage";
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
