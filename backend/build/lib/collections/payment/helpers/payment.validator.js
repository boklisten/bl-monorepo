import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class PaymentValidator {
    validate(payment) {
        if (!payment) {
            return Promise.reject(new BlError("payment is not defined"));
        }
        let order;
        return BlStorage.Orders.get(payment.order)
            .then((orderInStorage) => {
            order = orderInStorage;
            return this.validateIfOrderHasDelivery(payment, order);
        })
            .then(() => {
            return this.validatePaymentBasedOnMethod(payment);
        })
            .catch((validatePaymentError) => {
            if (validatePaymentError instanceof BlError) {
                throw validatePaymentError;
            }
            throw new BlError("could not validate payment, unknown error").store("error", validatePaymentError);
        });
    }
    validateIfOrderHasDelivery(payment, order) {
        if (!order.delivery) {
            return Promise.resolve(true);
        }
        return BlStorage.Deliveries.get(order.delivery).then((delivery) => {
            const expectedAmount = order.amount + delivery.amount;
            if (payment.amount !== expectedAmount) {
                throw new BlError(`payment.amount "${payment.amount}" is not equal to (order.amount + delivery.amount) "${expectedAmount}"`);
            }
            return true;
        });
    }
    validatePaymentBasedOnMethod(payment) {
        if (["dibs", "card", "cash", "vipps"].includes(payment.method))
            return true;
        throw new BlError(`payment.method "${payment.method}" not supported`);
    }
}
