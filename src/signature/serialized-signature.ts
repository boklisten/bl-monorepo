import { BlDocument } from "../bl-document/bl-document";

export class SignatureMetadata extends BlDocument {
  static readonly NUM_MONTHS_VALID = 4 * 12;

  signingName: string;
  signedByGuardian: boolean;
  creationTime: Date;
}

export class SerializedSignature extends SignatureMetadata {
  base64EncodedImage: string;
}

export class SerializedGuardianSignature {
  customerId: string;
  base64EncodedImage: string;
  signingName: string;
}

export class CheckGuardianSignatureSpec {
  customerId: string;
}
