import { SignatureMetadata } from "@boklisten/bl-model";
import { Schema } from "mongoose";

import { ToSchema } from "@/helper/typescript-helpers";

export class Signature extends SignatureMetadata {
  image!: Buffer;
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
