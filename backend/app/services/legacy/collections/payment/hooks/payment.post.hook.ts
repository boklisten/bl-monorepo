import { PaymentValidator } from "#services/legacy/collections/payment/helpers/payment.validator";
import { Hook } from "#services/legacy/hook";
import { BlError } from "#shared/bl-error";
import { Payment } from "#shared/payment/payment";

export class PaymentPostHook extends Hook {
  private paymentValidator: PaymentValidator;

  constructor(paymentValidator?: PaymentValidator) {
    super();
    this.paymentValidator = paymentValidator ?? new PaymentValidator();
  }

  public override before(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(true);
    });
  }

  public override after(payments: Payment[]): Promise<Payment[]> {
    return new Promise((resolve, reject) => {
      if (!payments || payments.length != 1) {
        return reject(new BlError("payments is empty or undefined"));
      }

      const payment = payments[0];

      this.paymentValidator.validate(payment).catch((blError: BlError) => {
        reject(new BlError("payment could not be validated").add(blError));
      });
    });
  }
}
