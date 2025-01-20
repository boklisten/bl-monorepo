import { BlDocument } from "@shared/bl-document/bl-document.js";

export interface OpeningHour extends BlDocument {
  from: Date;
  to: Date;
  branch: string;
}
