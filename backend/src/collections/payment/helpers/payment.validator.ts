import { BlCollectionName } from "@backend/collections/bl-collection";
import { deliverySchema } from "@backend/collections/delivery/delivery.schema";
import { orderSchema } from "@backend/collections/order/order.schema";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";

export class PaymentValidator {
  private orderStorage: BlDocumentStorage<Order>;
  private deliveryStorage: BlDocumentStorage<Delivery>;

  constructor(
    orderStorage?: BlDocumentStorage<Order>,
    deliveryStorage?: BlDocumentStorage<Delivery>,
  ) {
    this.orderStorage = orderStorage
      ? orderStorage
      : new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this.deliveryStorage = deliveryStorage
      ? deliveryStorage
      : new BlDocumentStorage<Delivery>(
          BlCollectionName.Deliveries,
          deliverySchema,
        );
  }

  public validate(payment: Payment): Promise<boolean> {
    if (!payment) {
      return Promise.reject(new BlError("payment is not defined"));
    }

    let order: Order;

    return this.orderStorage
      .get(payment.order)
      .then((orderInStorage: Order) => {
        order = orderInStorage;
        return this.validateIfOrderHasDelivery(payment, order);
      })
      .then(() => {
        return this.validatePaymentBasedOnMethod(payment);
      })
      .catch((validatePaymentError: unknown) => {
        if (validatePaymentError instanceof BlError) {
          throw validatePaymentError;
        }
        throw new BlError("could not validate payment, unknown error").store(
          "error",
          validatePaymentError,
        );
      });
  }

  private validateIfOrderHasDelivery(
    payment: Payment,
    order: Order,
  ): Promise<boolean> {
    if (!order.delivery) {
      return Promise.resolve(true);
    }

    return this.deliveryStorage
      .get(order.delivery)
      .then((delivery: Delivery) => {
        const expectedAmount = order.amount + delivery.amount;

        if (payment.amount !== expectedAmount) {
          throw new BlError(
            `payment.amount "${payment.amount}" is not equal to (order.amount + delivery.amount) "${expectedAmount}"`,
          );
        }
        return true;
      });
  }

  private validatePaymentBasedOnMethod(payment: Payment): boolean {
    if (["dibs", "card", "cash", "vipps"].includes(payment.method)) return true;
    throw new BlError(`payment.method "${payment.method}" not supported`);
  }
}
