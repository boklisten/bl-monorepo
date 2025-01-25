import { DibsEasyPaymentConsumerBillingAddress } from "#services/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer-billing-address";
import { DibsEasyPaymentConsumerCompany } from "#services/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer-company";
import { DibsEasyPaymentConsumerPrivatePerson } from "#services/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer-private-person";
import { DibsEasyPaymentConsumerShippingAddress } from "#services/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer-shipping-address";

export class DibsEasyPaymentConsumer {
  billingAddress?: DibsEasyPaymentConsumerBillingAddress;
  shippingAddress?: DibsEasyPaymentConsumerShippingAddress;
  company?: DibsEasyPaymentConsumerCompany;
  privatePerson?: DibsEasyPaymentConsumerPrivatePerson;
}
