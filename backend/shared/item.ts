import { BlDocument } from "#shared/bl-document";

export interface Item extends BlDocument {
  title: string;
  price: number;
  info: {
    isbn: number;
    subject: string;
    year: number;
    price: Record<string, number>;
    weight: string;
    distributor: string;
    publisher: string;
  };
  buyback: boolean;
}
