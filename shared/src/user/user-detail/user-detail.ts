import { BlDocument } from "../../bl-document/bl-document";

export class UserDetail extends BlDocument {
  name: string;
  email: string;
  phone: string;
  address: string;
  postCode: string;
  postCity: string;
  country: string;
  dob: Date;
  branch: string;
  emailConfirmed?: boolean;
  guardian?: {
    name: string;
    email: string;
    emailConfirmed?: boolean;
    phone: string;
    confirmed?: boolean;
  };
  orders?: string[];
  customerItems?: string[];
  signatures: string[];
}
