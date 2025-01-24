import { DibsEasyPaymentConsumerPhone } from "@backend/lib/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer-phone.js";

export interface DibsEasyPaymentConsumerCompany {
  name: string;
  organisationNumber: string;
  email: string;
  phoneNumber: DibsEasyPaymentConsumerPhone;
  merchantReference: string;
}
