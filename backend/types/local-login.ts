import { BlDocument } from "@shared/bl-document/bl-document.js";

export interface LocalLogin extends BlDocument {
  username: string;
  salt: string;
  hashedPassword: string;
  provider: string;
  providerId: string;
}
