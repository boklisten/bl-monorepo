import { DeliveryModel } from "@backend/collections/delivery/delivery.model";
import { PaymentModel } from "@backend/collections/payment/payment.model";
import { isNullish } from "@backend/helper/typescript-helpers";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";

export class OrderPlacedValidator {
  private deliveryStorage: BlDocumentStorage<Delivery>;
  private paymentStorage: BlDocumentStorage<Payment>;

  constructor(
    deliveryStorage?: BlDocumentStorage<Delivery>,
    paymentStorage?: BlDocumentStorage<Payment>,
  ) {
    this.deliveryStorage = deliveryStorage
      ? deliveryStorage
      : new BlDocumentStorage(DeliveryModel);
    this.paymentStorage = paymentStorage
      ? paymentStorage
      : new BlDocumentStorage(PaymentModel);
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
