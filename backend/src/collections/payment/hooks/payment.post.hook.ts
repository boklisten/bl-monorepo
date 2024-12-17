import { BlCollectionName } from "@backend/collections/bl-collection";
import { orderSchema } from "@backend/collections/order/order.schema";
import { PaymentDibsHandler } from "@backend/collections/payment/helpers/dibs/payment-dibs-handler";
import { PaymentValidator } from "@backend/collections/payment/helpers/payment.validator";
import { Hook } from "@backend/hook/hook";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { AccessToken } from "@shared/token/access-token";

export class PaymentPostHook extends Hook {
  private orderStorage: BlDocumentStorage<Order>;
  private paymentValidator: PaymentValidator;
  private paymentDibsHandler: PaymentDibsHandler;

  constructor(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    paymentStorage?: BlDocumentStorage<Payment>,
    orderStorage?: BlDocumentStorage<Order>,
    paymentValidator?: PaymentValidator,
    paymentDibsHandler?: PaymentDibsHandler,
  ) {
    super();
    this.paymentValidator = paymentValidator ?? new PaymentValidator();
    this.orderStorage =
      orderStorage ??
      new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this.paymentDibsHandler = paymentDibsHandler ?? new PaymentDibsHandler();
  }

  public override before(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(true);
    });
  }

  public override after(
    payments: Payment[],
    accessToken: AccessToken,
  ): Promise<Payment[]> {
    return new Promise((resolve, reject) => {
      if (!payments || payments.length != 1) {
        return reject(new BlError("payments is empty or undefined"));
      }

      if (!accessToken) {
        return reject(new BlError("accessToken is undefined"));
      }

      const payment = payments[0];

      this.paymentValidator
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .validate(payment)
        .then(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.handlePaymentBasedOnMethod(payment, accessToken)
            .then((updatedPayment: Payment) => {
              this.updateOrderWithPayment(updatedPayment, accessToken)
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

  private handlePaymentBasedOnMethod(
    payment: Payment,
    accessToken: AccessToken,
  ): Promise<Payment> {
    return new Promise((resolve, reject) => {
      switch (payment.method) {
        case "dibs":
          return payment.amount < 0
            ? resolve(payment)
            : this.paymentDibsHandler
                .handleDibsPayment(payment, accessToken)
                .then((updatedPayment: Payment) => {
                  return resolve(updatedPayment);
                })
                .catch((blError: BlError) => {
                  reject(blError);
                });
        default:
          return resolve(payment);
      }
    });
  }

  private updateOrderWithPayment(
    payment: Payment,
    accessToken: AccessToken,
  ): Promise<Payment> {
    return new Promise((resolve, reject) => {
      this.orderStorage
        .get(payment.order)
        .then((order: Order) => {
          const paymentIds = order.payments ?? [];

          if (paymentIds.indexOf(payment.id) > -1) {
            reject(
              new BlError(
                `order.payments already includes payment "${payment.id}"`,
              ),
            );
          } else {
            paymentIds.push(payment.id);
          }
          return this.orderStorage
            .update(
              order.id,
              { payments: paymentIds },
              { id: accessToken.sub, permission: accessToken.permission },
            )
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
