import { DibsEasyPaymentDetailsCard } from "@/payment/dibs/dibs-easy-payment/dibs-easy-payment-details/dibs-easy-payment-details-card";
import { DibsEasyPaymentDetailsInvoiceDetail } from "@/payment/dibs/dibs-easy-payment/dibs-easy-payment-details/dibs-easy-payment-details-invoice-detail";

export interface DibsEasyPaymentDetails {
  paymentType: string;
  paymentMethod: string;
  invoiceDetails?: DibsEasyPaymentDetailsInvoiceDetail;
  cardDetails: DibsEasyPaymentDetailsCard;
}
