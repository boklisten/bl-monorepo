import { BlDocument } from "../bl-document/bl-document";

export class Booking extends BlDocument {
  from: Date;
  to: Date;
  customer: string;
  branch: string;
  booked?: boolean;
}
