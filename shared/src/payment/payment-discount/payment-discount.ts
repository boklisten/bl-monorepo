export type PaymentDiscount = {
  amount: number; //the amount this discount is on, 100 means 100kr
  coupon?: string; //the coupon code for this discount, if it have one
};
