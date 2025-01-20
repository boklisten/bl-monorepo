import { BlModel } from "@backend/storage/bl-storage.js";
import { SignatureMetadata } from "@shared/signature/serialized-signature.js";
import { Schema } from "mongoose";

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
