import { BlDocument } from "../bl-document/bl-document";

export class OpeningHour extends BlDocument {
  from: Date;
  to: Date;
  branch: string;
}
