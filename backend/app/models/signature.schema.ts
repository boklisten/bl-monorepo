import { Schema } from "mongoose";

import { BlSchema } from "#services/storage/bl-storage";
import { SignatureMetadata } from "#shared/signature/serialized-signature";

export interface Signature extends SignatureMetadata {
  image: Buffer;
}

export const SignatureSchema: BlSchema<Signature> = new Schema({
  image: {
    type: Buffer,
    required: true,
  },
  signingName: {
    type: String,
    trim: true,
    required: true,
  },
  signedByGuardian: {
    type: Boolean,
    required: true,
  },
});
