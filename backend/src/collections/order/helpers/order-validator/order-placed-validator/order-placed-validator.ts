import { Order, Delivery, Payment, BlError } from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { deliverySchema } from "@/collections/delivery/delivery.schema";
import { paymentSchema } from "@/collections/payment/payment.schema";
import { isNullish } from "@/helper/typescript-helpers";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class OrderPlacedValidator {
  private deliveryStorage: BlDocumentStorage<Delivery>;
  private paymentStorage: BlDocumentStorage<Payment>;

  constructor(
    deliveryStorage?: BlDocumentStorage<Delivery>,
    paymentStorage?: BlDocumentStorage<Payment>,
  ) {
    this.deliveryStorage = deliveryStorage
      ? deliveryStorage
      : new BlDocumentStorage(BlCollectionName.Deliveries, deliverySchema);
    this.paymentStorage = paymentStorage
      ? paymentStorage
      : new BlDocumentStorage(BlCollectionName.Payments, paymentSchema);
  }

  public validate(order: Order): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!order.placed) {
        resolve(true);
      }

      if (!this.validateOrderItems(order)) {
        return reject(
          new BlError(
            "total of order.orderItems amount is not equal to order.amount",
          ),
        );
      }

      if (isNullish(order.payments) || order.payments.length <= 0) {
        return resolve(true); // if there are no payments, there is no need do do more validation
      }

      if (isNullish(order.delivery)) {
        // if there are payments but no delivery
        return this.validatePayments(order);
      } else {
        // when delivery is attached
        this.deliveryStorage
          .get(order.delivery)
          .then((delivery: Delivery) => {
            this.validatePayments(order, delivery)
              .then(() => {
                resolve(true);
              })
              .catch((paymentValidationError: BlError) => {
                reject(paymentValidationError);
              });
          })
          .catch((blError: BlError) => {
            reject(
              new BlError(`delivery "${order.delivery}" not found`).add(
                blError,
              ),
            );
          });
      }
    });
  }

  private validateOrderItems(order: Order): boolean {
    let orderItemTotalAmount = 0;

    for (const orderItem of order.orderItems) {
      orderItemTotalAmount += orderItem.amount;
    }

    return order.amount === orderItemTotalAmount;
  }

  private validatePayments(
    order: Order,
    delivery?: Delivery,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const totalOrderAmount = order.amount + (delivery ? delivery.amount : 0);

      this.paymentStorage
        .getMany(order.payments as string[])
        .then((payments: Payment[]) => {
          let paymentTotal = 0;

          for (const payment of payments) {
            if (!payment.confirmed) {
              return reject(
                new BlError("payment is not confirmed").store(
                  "paymentId",
                  payment.id,
                ),
              );
            }
            paymentTotal += payment.amount;
          }

          if (paymentTotal != totalOrderAmount) {
            return reject(
              new BlError(
                "total amount of payments is not equal to total of order.amount + delivery.amount",
              ),
            );
          }

          resolve(true);
        })
        .catch((blError: BlError) => {
          reject(
            new BlError("order.payments is not found").code(702).add(blError),
          );
        });
    });
  }
}
