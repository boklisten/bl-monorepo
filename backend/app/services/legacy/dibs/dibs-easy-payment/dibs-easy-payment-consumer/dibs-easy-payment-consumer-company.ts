import { DibsEasyPaymentConsumerPhone } from "#services/legacy/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer-phone";

export interface DibsEasyPaymentConsumerCompany {
  name: string;
  organisationNumber: string;
  email: string;
  phoneNumber: DibsEasyPaymentConsumerPhone;
  merchantReference: string;
}
