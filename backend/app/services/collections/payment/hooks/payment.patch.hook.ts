import { PaymentDibsHandler } from "#services/collections/payment/helpers/dibs/payment-dibs-handler";
import { PaymentValidator } from "#services/collections/payment/helpers/payment.validator";
import { Hook } from "#services/hook/hook";
import { BlError } from "#shared/bl-error/bl-error";
import { Payment } from "#shared/payment/payment";

export class PaymentPatchHook extends Hook {
  private paymentDibsHandler: PaymentDibsHandler;
  private paymentValidator: PaymentValidator;

  constructor(
    paymentDibsHandler?: PaymentDibsHandler,
    paymentValidator?: PaymentValidator,
  ) {
    super();
    this.paymentDibsHandler = paymentDibsHandler ?? new PaymentDibsHandler();
    this.paymentValidator = paymentValidator ?? new PaymentValidator();
  }

  override after(payments: Payment[]): Promise<Payment[]> {
    if (!payments || payments.length !== 1) {
      return Promise.reject(new BlError("payments are empty or undefined"));
    }

    // @ts-expect-error fixme: auto ignored
    let payment: Payment = payments[0];

    return this.updatePaymentBasedOnMethod(payment)
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

  private updatePaymentBasedOnMethod(payment: Payment): Promise<Payment> {
    switch (payment.method) {
      case "later": {
        return Promise.resolve(payment);
      }
      case "dibs": {
        return this.paymentDibsHandler.handleDibsPayment(payment);
      }
      default: {
        return Promise.reject(
          new BlError(`payment.method "${payment.method}" not supported`),
        );
      }
    }
  }
}
