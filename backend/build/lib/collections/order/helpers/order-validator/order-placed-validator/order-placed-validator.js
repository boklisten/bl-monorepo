import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class OrderPlacedValidator {
    validate(order) {
        return new Promise((resolve, reject) => {
            if (!order.placed) {
                resolve(true);
            }
            if (!this.validateOrderItems(order)) {
                return reject(new BlError("total of order.orderItems amount is not equal to order.amount"));
            }
            if (isNullish(order.payments) || order.payments.length <= 0) {
                return resolve(true); // if there are no payments, there is no need do do more validation
            }
            if (isNullish(order.delivery)) {
                // if there are payments but no delivery
                return this.validatePayments(order);
            }
            else {
                // when delivery is attached
                BlStorage.Deliveries.get(order.delivery)
                    .then((delivery) => {
                    this.validatePayments(order, delivery)
                        .then(() => {
                        resolve(true);
                    })
                        .catch((paymentValidationError) => {
                        reject(paymentValidationError);
                    });
                })
                    .catch((blError) => {
                    reject(new BlError(`delivery "${order.delivery}" not found`).add(blError));
                });
            }
        });
    }
    validateOrderItems(order) {
        let orderItemTotalAmount = 0;
        for (const orderItem of order.orderItems) {
            orderItemTotalAmount += orderItem.amount;
        }
        return order.amount === orderItemTotalAmount;
    }
    validatePayments(order, delivery) {
        return new Promise((resolve, reject) => {
            const totalOrderAmount = order.amount + (delivery ? delivery.amount : 0);
            BlStorage.Payments.getMany(order.payments)
                .then((payments) => {
                let paymentTotal = 0;
                for (const payment of payments) {
                    if (!payment.confirmed) {
                        return reject(new BlError("payment is not confirmed").store("paymentId", payment.id));
                    }
                    paymentTotal += payment.amount;
                }
                if (paymentTotal != totalOrderAmount) {
                    return reject(new BlError("total amount of payments is not equal to total of order.amount + delivery.amount"));
                }
                resolve(true);
            })
                .catch((blError) => {
                reject(new BlError("order.payments is not found").code(702).add(blError));
            });
        });
    }
}
