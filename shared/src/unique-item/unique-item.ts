import { BlDocument } from "../bl-document/bl-document";

export class UniqueItem extends BlDocument {
  override blid: string; // a 12 character long unique identification
  item: string; // id of item
  title: string; // the title of the item
  location?: string;
  actions?: {
    time: Date;
    type: "created" | "moved" | "handout" | "delivered" | "deleted";
    location: {
      region: string;
      id: string;
    };
    user: string;
  }[];
}
