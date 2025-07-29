import { BlDocument } from "#shared/bl-document";

export interface PendingPasswordReset extends BlDocument {
  email: string;
  tokenHash: string;
}
