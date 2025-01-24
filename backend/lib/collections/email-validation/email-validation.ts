import { BlDocument } from "@shared/bl-document/bl-document.js";

export interface EmailValidation extends BlDocument {
  email: string;
  userDetail: string;
}
