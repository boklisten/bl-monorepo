import { DibsEasyPaymentConsumerPhone } from "@backend/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer-phone";

export interface DibsEasyPaymentConsumerPrivatePerson {
  dateOfBirth: Date;
  email: string;
  firstName: string;
  lastName: string;
  merchantReference: string;
  phoneNumber: DibsEasyPaymentConsumerPhone;
}
