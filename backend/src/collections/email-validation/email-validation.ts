import { BlDocument } from "@shared/bl-document/bl-document";

export interface EmailValidation extends BlDocument {
  email: string;
  userDetail: string;
}
