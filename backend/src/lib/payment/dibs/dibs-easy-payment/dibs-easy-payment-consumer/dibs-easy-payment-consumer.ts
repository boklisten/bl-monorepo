import { DibsEasyPaymentConsumerBillingAddress } from "@backend/lib/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer-billing-address.js";
import { DibsEasyPaymentConsumerCompany } from "@backend/lib/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer-company.js";
import { DibsEasyPaymentConsumerPrivatePerson } from "@backend/lib/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer-private-person.js";
import { DibsEasyPaymentConsumerShippingAddress } from "@backend/lib/payment/dibs/dibs-easy-payment/dibs-easy-payment-consumer/dibs-easy-payment-consumer-shipping-address.js";

export class DibsEasyPaymentConsumer {
  billingAddress?: DibsEasyPaymentConsumerBillingAddress;
  shippingAddress?: DibsEasyPaymentConsumerShippingAddress;
  company?: DibsEasyPaymentConsumerCompany;
  privatePerson?: DibsEasyPaymentConsumerPrivatePerson;
}
