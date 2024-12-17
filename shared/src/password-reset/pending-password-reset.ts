import { BlDocument } from "../bl-document/bl-document";

export class PendingPasswordReset extends BlDocument {
  email: string;
  tokenHash: string;
  salt: string;
}
