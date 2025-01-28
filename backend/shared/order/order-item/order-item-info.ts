import { OrderItemBuybackInfo } from "#shared/order/order-item/order-item-buyback-info";
import { OrderItemExtendInfo } from "#shared/order/order-item/order-item-extend-info";
import { OrderItemPartlyPaymentInfo } from "#shared/order/order-item/order-item-partly-payment-info";
import { OrderItemRentInfo } from "#shared/order/order-item/order-item-rent-info";

export type OrderItemInfo =
  | OrderItemExtendInfo
  | OrderItemRentInfo
  | OrderItemPartlyPaymentInfo
  | OrderItemBuybackInfo;
