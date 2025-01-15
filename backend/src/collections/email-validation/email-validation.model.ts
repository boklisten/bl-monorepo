import { BlModel } from "@backend/collections/bl-collection";
import { EmailValidation } from "@backend/collections/email-validation/email-validation";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { Schema } from "mongoose";

export const EmailValidationModel: BlModel<EmailValidation> = {
  name: "email_validations",
  schema: new Schema<ToSchema<EmailValidation>>({
    email: {
      type: String,
      required: true,
    },
    userDetail: Schema.Types.ObjectId,
  }),
};
