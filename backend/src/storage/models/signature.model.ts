import { BlModel } from "@backend/storage/bl-storage";
import { SignatureMetadata } from "@shared/signature/serialized-signature";
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
