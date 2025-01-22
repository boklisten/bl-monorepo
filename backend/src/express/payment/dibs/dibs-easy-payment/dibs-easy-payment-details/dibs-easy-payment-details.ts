import { DibsEasyPaymentDetailsCard } from "@backend/express/payment/dibs/dibs-easy-payment/dibs-easy-payment-details/dibs-easy-payment-details-card.js";
import { DibsEasyPaymentDetailsInvoiceDetail } from "@backend/express/payment/dibs/dibs-easy-payment/dibs-easy-payment-details/dibs-easy-payment-details-invoice-detail.js";

export interface DibsEasyPaymentDetails {
  paymentType: string;
  paymentMethod: string;
  invoiceDetails?: DibsEasyPaymentDetailsInvoiceDetail;
  cardDetails: DibsEasyPaymentDetailsCard;
}
