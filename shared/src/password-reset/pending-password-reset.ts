import { BlDocument } from "@shared/bl-document/bl-document.js";

export interface PendingPasswordReset extends BlDocument {
  email: string;
  tokenHash: string;
  salt: string;
}
