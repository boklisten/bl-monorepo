import { Schema } from "mongoose";

import { EmailValidation } from "#services/collections/email-validation/email-validation";
import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage/bl-storage";

export const EmailValidationSchema: BlSchema<EmailValidation> = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  userDetail: {
    type: Schema.Types.ObjectId,
    ref: BlSchemaName.UserDetails,
  },
  creationTime: {
    type: Date,
    index: {
      name: "expire_after",
      expires: 60 * 20,
    },
  },
});
