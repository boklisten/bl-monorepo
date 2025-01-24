import { PaymentDibsHandler } from "@backend/lib/collections/payment/helpers/dibs/payment-dibs-handler.js";
import { PaymentValidator } from "@backend/lib/collections/payment/helpers/payment.validator.js";
import { Hook } from "@backend/lib/hook/hook.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class PaymentPostHook extends Hook {
    paymentValidator;
    paymentDibsHandler;
    constructor(paymentValidator, paymentDibsHandler) {
        super();
        this.paymentValidator = paymentValidator ?? new PaymentValidator();
        this.paymentDibsHandler = paymentDibsHandler ?? new PaymentDibsHandler();
    }
    before() {
        return new Promise((resolve) => {
            resolve(true);
        });
    }
    after(payments) {
        return new Promise((resolve, reject) => {
            if (!payments || payments.length != 1) {
                return reject(new BlError("payments is empty or undefined"));
            }
            const payment = payments[0];
            this.paymentValidator
                // @ts-expect-error fixme: auto ignored
                .validate(payment)
                .then(() => {
                // @ts-expect-error fixme: auto ignored
                this.handlePaymentBasedOnMethod(payment)
                    .then((updatedPayment) => {
                    this.updateOrderWithPayment(updatedPayment)
                        .then(() => {
                        resolve([updatedPayment]);
                    })
                        .catch((updateOrderError) => {
                        reject(new BlError("order could not be updated with paymentId").add(updateOrderError));
                    });
                })
                    .catch((handlePaymentMethodError) => {
                    reject(handlePaymentMethodError);
                });
            })
                .catch((blError) => {
                reject(new BlError("payment could not be validated").add(blError));
            });
        });
    }
    handlePaymentBasedOnMethod(payment) {
        return new Promise((resolve, reject) => {
            switch (payment.method) {
                case "dibs": {
                    return payment.amount < 0
                        ? resolve(payment)
                        : this.paymentDibsHandler
                            .handleDibsPayment(payment)
                            .then((updatedPayment) => {
                            return resolve(updatedPayment);
                        })
                            .catch((blError) => {
                            reject(blError);
                        });
                }
                default: {
                    return resolve(payment);
                }
            }
        });
    }
    updateOrderWithPayment(payment) {
        return new Promise((resolve, reject) => {
            BlStorage.Orders.get(payment.order)
                .then((order) => {
                const paymentIds = order.payments ?? [];
                if (paymentIds.includes(payment.id)) {
                    reject(new BlError(`order.payments already includes payment "${payment.id}"`));
                }
                else {
                    paymentIds.push(payment.id);
                }
                return BlStorage.Orders.update(order.id, { payments: paymentIds })
                    .then(() => {
                    resolve(payment);
                })
                    .catch((blError) => {
                    reject(new BlError("could not update orders").add(blError));
                });
            })
                .catch(() => {
                reject(new BlError("could not get order when adding payment id"));
            });
        });
    }
}
