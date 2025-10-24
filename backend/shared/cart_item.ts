type CartItemType = "rent" | "partly-payment" | "buy" | "extend" | "buyout";

export interface CartItemOption {
  type: CartItemType;
  price: number;
  payLater?: number;
  to?: Date;
}

export interface CartItem {
  id: string;
  title: string;
  branchId: string;
  subject?: string;
  options: CartItemOption[];
  selectedOptionIndex: number;
}

export interface CheckoutCartItem {
  id: string;
  branchId: string;
  type: CartItemType;
  to?: Date | undefined;
}
