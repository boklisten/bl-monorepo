import { DibsEasyPaymentRefundOrderItem } from "@backend/payment/dibs/dibs-easy-payment/dibs-easy-payment-refund/dibs-easy-payment-refund-order-item.js";

export interface DibsEasyPaymentRefund {
  refundId: string;
  amount: number;
  state: string;
  lastUpdated: string;
  orderItems: DibsEasyPaymentRefundOrderItem[];
}
