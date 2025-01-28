import { BlDocument } from "#shared/bl-document/bl-document";

export interface PendingPasswordReset extends BlDocument {
  email: string;
  tokenHash: string;
  salt: string;
}
