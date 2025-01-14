export class DibsEasyItem {
  // @ts-expect-error fixme: auto ignored
  reference: string; //the reference of the orderItem

  // @ts-expect-error fixme: auto ignored
  name: string; //the title/name of the item

  // @ts-expect-error fixme: auto ignored
  quantity: number; //number of items

  // @ts-expect-error fixme: auto ignored
  unit: "kg" | "pcs" | "book" | "delivery";

  // @ts-expect-error fixme: auto ignored
  unitPrice: number; //price for a single item excluding VAT

  // @ts-expect-error fixme: auto ignored
  taxRate: number; //a number representing a percent: ex: 2500 is equal to 25%

  // @ts-expect-error fixme: auto ignored
  taxAmount: number; // the total VAT amount of this order item

  // @ts-expect-error fixme: auto ignored
  grossTotalAmount: number; //the total amount including VAT (netTotal + (netTotal * taxRate)

  // @ts-expect-error fixme: auto ignored
  netTotalAmount: number; //the total amount excluding VAT (unitPrice * quantity)
}
