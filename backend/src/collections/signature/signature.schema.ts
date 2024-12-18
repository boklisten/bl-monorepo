import { ToSchema } from "@backend/helper/typescript-helpers";
import { SignatureMetadata } from "@shared/signature/serialized-signature";
import { Schema } from "mongoose";

export interface Signature extends SignatureMetadata {
  image: Buffer;
}

export const signatureSchema = new Schema<ToSchema<Signature>>({
  image: {
    type: Buffer,
    required: true,
  },
  signingName: {
    type: String,
    required: true,
  },
  signedByGuardian: {
    type: Boolean,
    required: true,
  },
});
