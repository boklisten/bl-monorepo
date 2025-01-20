import { OrderItemBuybackInfo } from "@shared/order/order-item/order-item-buyback-info.js";
import { OrderItemExtendInfo } from "@shared/order/order-item/order-item-extend-info.js";
import { OrderItemPartlyPaymentInfo } from "@shared/order/order-item/order-item-partly-payment-info.js";
import { OrderItemRentInfo } from "@shared/order/order-item/order-item-rent-info.js";

export type OrderItemInfo =
  | OrderItemExtendInfo
  | OrderItemRentInfo
  | OrderItemPartlyPaymentInfo
  | OrderItemBuybackInfo;
