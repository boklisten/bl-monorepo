import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";
import { SignatureMetadata } from "#shared/signature/serialized-signature";

export interface Signature extends SignatureMetadata {
  image: Buffer;
}

export const SignatureModel: BlModel<Signature> = {
  name: "signatures",
  schema: new Schema({
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
  }),
};
