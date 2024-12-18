import { BlDocument } from "@shared/bl-document/bl-document";
import { ItemType } from "@shared/item/item-type";

export interface Item extends BlDocument {
  title: string;
  type: ItemType;
  digital: boolean;
  price: number;
  taxRate: number;
  info: {
    isbn: number;
    subject: string;
    year: number;
    price: Record<string, number>;
    weight: string;
    distributor: string;
    discount: number;
    publisher: string;
  };
  buyback: boolean;
  categories: string[];
}
