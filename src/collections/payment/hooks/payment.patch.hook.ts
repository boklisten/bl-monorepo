import { AccessToken, Payment, BlError } from "@boklisten/bl-model";

import { PaymentDibsHandler } from "@/collections/payment/helpers/dibs/payment-dibs-handler";
import { PaymentValidator } from "@/collections/payment/helpers/payment.validator";
import { Hook } from "@/hook/hook";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class PaymentPatchHook extends Hook {
  private paymentDibsHandler: PaymentDibsHandler;
  private paymentValidator: PaymentValidator;

  constructor(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    paymentStorage?: BlDocumentStorage<Payment>,
    paymentDibsHandler?: PaymentDibsHandler,
    paymentValidator?: PaymentValidator,
  ) {
    super();
    this.paymentDibsHandler = paymentDibsHandler ?? new PaymentDibsHandler();
    this.paymentValidator = paymentValidator ?? new PaymentValidator();
  }

  override before(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line
    body: any,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken: AccessToken,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id: string,
  ): Promise<boolean> {
    return Promise.resolve(true);
  }

  override after(
    payments: Payment[],
    accessToken: AccessToken,
  ): Promise<Payment[]> {
    if (!payments || payments.length !== 1) {
      return Promise.reject(new BlError("payments are empty or undefined"));
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let payment: Payment = payments[0];

    return this.updatePaymentBasedOnMethod(payment, accessToken)
      .then((updatedPayment: Payment) => {
        payment = updatedPayment;
        return this.paymentValidator.validate(updatedPayment);
      })
      .then(() => {
        return [payment];
      })
      .catch((paymentPatchError: BlError) => {
        throw paymentPatchError;
      });
  }

  private updatePaymentBasedOnMethod(
    payment: Payment,
    accessToken: AccessToken,
  ): Promise<Payment> {
    switch (payment.method) {
      case "later":
        return this.handlePaymentLater(payment, accessToken);
      case "dibs":
        return this.paymentDibsHandler.handleDibsPayment(payment, accessToken);
      default:
        return Promise.reject(
          new BlError(`payment.method "${payment.method}" not supported`),
        );
    }
  }

  private handlePaymentLater(
    payment: Payment,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken: AccessToken,
  ): Promise<Payment> {
    return Promise.resolve(payment);
  }
}
