import { DibsEasyPaymentConsumerPhone } from "@backend/lib/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer-phone.js";

export interface DibsEasyPaymentConsumerPrivatePerson {
  dateOfBirth: Date;
  email: string;
  firstName: string;
  lastName: string;
  merchantReference: string;
  phoneNumber: DibsEasyPaymentConsumerPhone;
}
