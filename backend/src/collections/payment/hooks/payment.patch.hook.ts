import { PaymentDibsHandler } from "@backend/collections/payment/helpers/dibs/payment-dibs-handler";
import { PaymentValidator } from "@backend/collections/payment/helpers/payment.validator";
import { Hook } from "@backend/hook/hook";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Payment } from "@shared/payment/payment";
import { AccessToken } from "@shared/token/access-token";

export class PaymentPatchHook extends Hook {
  private paymentDibsHandler: PaymentDibsHandler;
  private paymentValidator: PaymentValidator;

  constructor(
    paymentStorage?: BlDocumentStorage<Payment>,
    paymentDibsHandler?: PaymentDibsHandler,
    paymentValidator?: PaymentValidator,
  ) {
    super();
    this.paymentDibsHandler = paymentDibsHandler ?? new PaymentDibsHandler();
    this.paymentValidator = paymentValidator ?? new PaymentValidator();
  }

  override before(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    body: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken: AccessToken,
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

    // @ts-expect-error fixme: auto ignored
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
      case "later": {
        return this.handlePaymentLater(payment, accessToken);
      }
      case "dibs": {
        return this.paymentDibsHandler.handleDibsPayment(payment, accessToken);
      }
      default: {
        return Promise.reject(
          new BlError(`payment.method "${payment.method}" not supported`),
        );
      }
    }
  }

  private handlePaymentLater(
    payment: Payment,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken: AccessToken,
  ): Promise<Payment> {
    return Promise.resolve(payment);
  }
}
