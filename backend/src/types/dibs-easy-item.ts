export interface DibsEasyItem {
  reference: string; //the reference of the orderItem
  name: string; //the title/name of the item
  quantity: number; //number of items
  unit: "kg" | "pcs" | "book" | "delivery";
  unitPrice: number; //price for a single item excluding VAT
  taxRate: number; //a number representing a percent: ex: 2500 is equal to 25%
  taxAmount: number; // the total VAT amount of this order item
  grossTotalAmount: number; //the total amount including VAT (netTotal + (netTotal * taxRate)
  netTotalAmount: number; //the total amount excluding VAT (unitPrice * quantity)
}
