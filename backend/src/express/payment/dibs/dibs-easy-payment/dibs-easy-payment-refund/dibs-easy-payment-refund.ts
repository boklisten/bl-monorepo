import { DibsEasyPaymentRefundOrderItem } from "@backend/express/payment/dibs/dibs-easy-payment/dibs-easy-payment-refund/dibs-easy-payment-refund-order-item.js";

export interface DibsEasyPaymentRefund {
  refundId: string;
  amount: number;
  state: string;
  lastUpdated: string;
  orderItems: DibsEasyPaymentRefundOrderItem[];
}
