import { DibsEasyPaymentRefundOrderItem } from "#services/payment/dibs/dibs-easy-payment/dibs-easy-payment-refund/dibs-easy-payment-refund-order-item";

export interface DibsEasyPaymentRefund {
  refundId: string;
  amount: number;
  state: string;
  lastUpdated: string;
  orderItems: DibsEasyPaymentRefundOrderItem[];
}
