import { PaymentDibsHandler } from "@backend/lib/collections/payment/helpers/dibs/payment-dibs-handler.js";
import { PaymentValidator } from "@backend/lib/collections/payment/helpers/payment.validator.js";
import { Hook } from "@backend/lib/hook/hook.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class PaymentPatchHook extends Hook {
    paymentDibsHandler;
    paymentValidator;
    constructor(paymentDibsHandler, paymentValidator) {
        super();
        this.paymentDibsHandler = paymentDibsHandler ?? new PaymentDibsHandler();
        this.paymentValidator = paymentValidator ?? new PaymentValidator();
    }
    after(payments) {
        if (!payments || payments.length !== 1) {
            return Promise.reject(new BlError("payments are empty or undefined"));
        }
        // @ts-expect-error fixme: auto ignored
        let payment = payments[0];
        return this.updatePaymentBasedOnMethod(payment)
            .then((updatedPayment) => {
            payment = updatedPayment;
            return this.paymentValidator.validate(updatedPayment);
        })
            .then(() => {
            return [payment];
        })
            .catch((paymentPatchError) => {
            throw paymentPatchError;
        });
    }
    updatePaymentBasedOnMethod(payment) {
        switch (payment.method) {
            case "later": {
                return Promise.resolve(payment);
            }
            case "dibs": {
                return this.paymentDibsHandler.handleDibsPayment(payment);
            }
            default: {
                return Promise.reject(new BlError(`payment.method "${payment.method}" not supported`));
            }
        }
    }
}
