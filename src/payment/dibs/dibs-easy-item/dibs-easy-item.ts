export class DibsEasyItem {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  reference: string; //the reference of the orderItem
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  name: string; //the title/name of the item
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  quantity: number; //number of items
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  unit: "kg" | "pcs" | "book" | "delivery";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  unitPrice: number; //price for a single item excluding VAT
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  taxRate: number; //a number representing a percent: ex: 2500 is equal to 25%
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  taxAmount: number; // the total VAT amount of this order item
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  grossTotalAmount: number; //the total amount including VAT (netTotal + (netTotal * taxRate)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  netTotalAmount: number; //the total amount excluding VAT (unitPrice * quantity)
}
