import { BlDocument } from "@shared/bl-document/bl-document";

export interface Booking extends BlDocument {
  from: Date;
  to: Date;
  customer: string;
  branch: string;
  booked?: boolean;
}
