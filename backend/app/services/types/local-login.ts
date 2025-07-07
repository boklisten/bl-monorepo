import { BlDocument } from "#shared/bl-document/bl-document";

export interface LocalLogin extends BlDocument {
  username: string;
  salt: string;
  hashedPassword: string;
}
