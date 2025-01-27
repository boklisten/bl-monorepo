import { BlDocument } from "#shared/bl-document/bl-document";

export const SIGNATURE_NUM_MONTHS_VALID = 4 * 12;

export interface SignatureMetadata extends BlDocument {
  signingName: string;
  signedByGuardian: boolean;
  creationTime: Date;
}

export interface SerializedSignature extends SignatureMetadata {
  base64EncodedImage: string;
}

export interface SerializedGuardianSignature {
  customerId: string;
  base64EncodedImage: string;
  signingName: string;
}

export interface CheckGuardianSignatureSpec {
  customerId: string;
}
