import { OrderItemExtendInfo } from "./order-item-extend-info";
import { OrderItemRentInfo } from "./order-item-rent-info";
import { OrderItemPartlyPaymentInfo } from "./order-item-partly-payment-info";
import { OrderItemBuybackInfo } from "./order-item-buyback-info";

export type OrderItemInfo =
  | OrderItemExtendInfo
  | OrderItemRentInfo
  | OrderItemPartlyPaymentInfo
  | OrderItemBuybackInfo;
