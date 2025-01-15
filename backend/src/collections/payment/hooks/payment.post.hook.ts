import { OrderModel } from "@backend/collections/order/order.model";
import { PaymentDibsHandler } from "@backend/collections/payment/helpers/dibs/payment-dibs-handler";
import { PaymentValidator } from "@backend/collections/payment/helpers/payment.validator";
import { Hook } from "@backend/hook/hook";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";

export class PaymentPostHook extends Hook {
  private orderStorage: BlStorage<Order>;
  private paymentValidator: PaymentValidator;
  private paymentDibsHandler: PaymentDibsHandler;

  constructor(
    orderStorage?: BlStorage<Order>,
    paymentValidator?: PaymentValidator,
    paymentDibsHandler?: PaymentDibsHandler,
  ) {
    super();
    this.paymentValidator = paymentValidator ?? new PaymentValidator();
    this.orderStorage = orderStorage ?? new BlStorage(OrderModel);
    this.paymentDibsHandler = paymentDibsHandler ?? new PaymentDibsHandler();
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

      this.paymentValidator

        // @ts-expect-error fixme: auto ignored
        .validate(payment)
        .then(() => {
          // @ts-expect-error fixme: auto ignored
          this.handlePaymentBasedOnMethod(payment)
            .then((updatedPayment: Payment) => {
              this.updateOrderWithPayment(updatedPayment)
                .then(() => {
                  resolve([updatedPayment]);
                })
                .catch((updateOrderError: BlError) => {
                  reject(
                    new BlError(
                      "order could not be updated with paymentId",
                    ).add(updateOrderError),
                  );
                });
            })
            .catch((handlePaymentMethodError: BlError) => {
              reject(handlePaymentMethodError);
            });
        })
        .catch((blError: BlError) => {
          reject(new BlError("payment could not be validated").add(blError));
        });
    });
  }

  private handlePaymentBasedOnMethod(payment: Payment): Promise<Payment> {
    return new Promise((resolve, reject) => {
      switch (payment.method) {
        case "dibs": {
          return payment.amount < 0
            ? resolve(payment)
            : this.paymentDibsHandler
                .handleDibsPayment(payment)
                .then((updatedPayment: Payment) => {
                  return resolve(updatedPayment);
                })
                .catch((blError: BlError) => {
                  reject(blError);
                });
        }
        default: {
          return resolve(payment);
        }
      }
    });
  }

  private updateOrderWithPayment(payment: Payment): Promise<Payment> {
    return new Promise((resolve, reject) => {
      this.orderStorage
        .get(payment.order)
        .then((order: Order) => {
          const paymentIds = order.payments ?? [];

          if (paymentIds.includes(payment.id)) {
            reject(
              new BlError(
                `order.payments already includes payment "${payment.id}"`,
              ),
            );
          } else {
            paymentIds.push(payment.id);
          }
          return this.orderStorage
            .update(order.id, { payments: paymentIds })
            .then(() => {
              resolve(payment);
            })
            .catch((blError: BlError) => {
              reject(new BlError("could not update orders").add(blError));
            });
        })
        .catch(() => {
          reject(new BlError("could not get order when adding payment id"));
        });
    });
  }
}
