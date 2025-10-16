export interface BuyoutCartItem {
  itemId: string;
  type: "buyout";
}

export interface ExtendCartItem {
  itemId: string;
  type: "extend";
  date: Date;
}

export type BuyoutOrExtendCartItem = BuyoutCartItem | ExtendCartItem;

export type VippsCheckoutState =
  | "SessionCreated"
  | "PaymentInitiated"
  | "SessionExpired"
  | "PaymentSuccessful"
  | "PaymentTerminated";
