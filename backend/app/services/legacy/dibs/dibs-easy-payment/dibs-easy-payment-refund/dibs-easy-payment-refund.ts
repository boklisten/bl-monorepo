import { DibsEasyPaymentRefundOrderItem } from "#services/legacy/dibs/dibs-easy-payment/dibs-easy-payment-refund/dibs-easy-payment-refund-order-item";

export interface DibsEasyPaymentRefund {
  refundId: string;
  amount: number;
  state: string;
  lastUpdated: string;
  orderItems: DibsEasyPaymentRefundOrderItem[];
}
