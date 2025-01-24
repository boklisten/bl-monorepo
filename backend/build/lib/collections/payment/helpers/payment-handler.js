import { PaymentDibsConfirmer } from "@backend/lib/collections/payment/helpers/dibs/payment-dibs-confirmer.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class PaymentHandler {
    paymentDibsConfirmer;
    constructor(paymentDibsConfirmer) {
        this.paymentDibsConfirmer =
            paymentDibsConfirmer ?? new PaymentDibsConfirmer();
    }
    async confirmPayments(order) {
        if (!order.payments || order.payments.length <= 0) {
            return [];
        }
        let payments;
        try {
            payments = await BlStorage.Payments.getMany(order.payments);
        }
        catch {
            throw new BlError("one or more payments was not found");
        }
        return await this.confirmAllPayments(order, payments);
    }
    async confirmAllPayments(order, payments) {
        await this.validateOrderAmount(order, payments);
        this.validatePaymentMethods(payments);
        for (const payment of payments) {
            if (payment.confirmed) {
                continue;
            }
            await this.confirmPayment(order, payment);
            await BlStorage.Payments.update(payment.id, { confirmed: true });
        }
        return payments;
    }
    confirmPayment(order, payment) {
        if (payment.method === "dibs") {
            return this.confirmMethodDibs(order, payment);
        }
        if (["card", "cash", "vipps"].includes(payment.method)) {
            if (order.byCustomer) {
                throw new BlError(`payment method "${payment.method}" is not permitted for customer`);
            }
            return Promise.resolve(true);
        }
        return Promise.reject(new BlError(`payment method "${payment.method}" not supported`));
    }
    validatePaymentMethods(payments) {
        if (payments.length > 1) {
            for (const payment of payments) {
                if (payment.method == "dibs") {
                    throw new BlError(`multiple payments found but "${payment.id}" have method dibs`);
                }
            }
        }
        return true;
    }
    async validateOrderAmount(order, payments) {
        const total = payments.reduce((subTotal, payment) => subTotal + payment.amount, 0);
        let orderTotal = order.amount;
        if (order.delivery) {
            const delivery = await BlStorage.Deliveries.get(order.delivery);
            orderTotal += delivery.amount;
        }
        if (total !== orderTotal) {
            throw new BlError("total of payment amounts does not equal order.amount + delivery.amount");
        }
        return true;
    }
    async confirmMethodDibs(order, payment) {
        return this.paymentDibsConfirmer.confirm(order, payment);
    }
}
