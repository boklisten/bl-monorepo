import { BlDocument } from "#shared/bl-document";

export interface OpeningHour extends BlDocument {
  from: Date;
  to: Date;
  branch: string;
}
