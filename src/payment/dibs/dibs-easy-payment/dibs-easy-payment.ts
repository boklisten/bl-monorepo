import { DibsEasyPaymentConsumer } from "@/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer";
import { DibsEasyPaymentDetails } from "@/payment/dibs/dibs-easy-payment/dibs-easy-payment-details/dibs-easy-payment-details";
import { DibsEasyPaymentOrderDetails } from "@/payment/dibs/dibs-easy-payment/dibs-easy-payment-order-details/dibs-easy-payment-order-details";
import { DibsEasyPaymentRefund } from "@/payment/dibs/dibs-easy-payment/dibs-easy-payment-refund/dibs-easy-payment-refund";
import { DibsEasyPaymentSummary } from "@/payment/dibs/dibs-easy-payment/dibs-easy-payment-summary/dibs-easy-payment-summary";

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
