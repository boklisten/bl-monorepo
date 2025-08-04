import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage_service";
import { BlDocument } from "#shared/bl-document";

interface EmailValidation extends BlDocument {
  userDetailId: string;
}

export const EmailValidationSchema: BlSchema<EmailValidation> = new Schema({
  userDetailId: {
    type: Schema.Types.ObjectId,
    ref: BlSchemaName.UserDetails,
  },
  creationTime: {
    type: Date,
    index: {
      name: "expire_after",
      expires: 60 * 60,
    },
  },
});
