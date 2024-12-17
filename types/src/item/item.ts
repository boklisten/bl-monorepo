import { BlDocument } from "../bl-document/bl-document";
import { ItemType } from "./item-type";

export class Item extends BlDocument {
  title: string;
  type: ItemType;
  price: number;
  taxRate: number;
  digital?: boolean;
  info?: any;
  desc?: string;
  buyback?: boolean;
  categories?: string[];
}
