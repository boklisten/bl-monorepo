import { BlDocument } from "#shared/bl-document";

export const SIGNATURE_NUM_MONTHS_VALID = 4 * 12;

export interface SignatureMetadata extends BlDocument {
  signingName: string;
  signedByGuardian: boolean;
}
