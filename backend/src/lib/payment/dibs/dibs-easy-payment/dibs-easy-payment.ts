import { DibsEasyPaymentConsumer } from "@backend/lib/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer.js";
import { DibsEasyPaymentDetails } from "@backend/lib/payment/dibs/dibs-easy-payment/dibs-easy-payment-details/dibs-easy-payment-details.js";
import { DibsEasyPaymentOrderDetails } from "@backend/lib/payment/dibs/dibs-easy-payment/dibs-easy-payment-order-details/dibs-easy-payment-order-details.js";
import { DibsEasyPaymentRefund } from "@backend/lib/payment/dibs/dibs-easy-payment/dibs-easy-payment-refund/dibs-easy-payment-refund.js";
import { DibsEasyPaymentSummary } from "@backend/lib/payment/dibs/dibs-easy-payment/dibs-easy-payment-summary/dibs-easy-payment-summary.js";

export interface DibsEasyPayment {
  paymentId: string;
  summary: DibsEasyPaymentSummary;
  consumer: DibsEasyPaymentConsumer;
  paymentDetails?: DibsEasyPaymentDetails;
  orderDetails: DibsEasyPaymentOrderDetails;
  checkout?: {
    url: string;
  };
  created: string;
  refunds?: DibsEasyPaymentRefund[];
}
