import { DeliveryModel } from "@backend/collections/delivery/delivery.model";
import { PaymentDibsConfirmer } from "@backend/collections/payment/helpers/dibs/payment-dibs-confirmer";
import { PaymentModel } from "@backend/collections/payment/payment.model";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";

export class PaymentHandler {
  private paymentStorage: BlStorage<Payment>;
  private paymentDibsConfirmer: PaymentDibsConfirmer;
  private deliveryStorage: BlStorage<Delivery>;

  constructor(
    paymentStorage?: BlStorage<Payment>,
    paymentDibsConfirmer?: PaymentDibsConfirmer,
    deliveryStorage?: BlStorage<Delivery>,
  ) {
    this.paymentStorage = paymentStorage ?? new BlStorage(PaymentModel);
    this.paymentDibsConfirmer =
      paymentDibsConfirmer ?? new PaymentDibsConfirmer();
    this.deliveryStorage = deliveryStorage ?? new BlStorage(DeliveryModel);
  }

  public async confirmPayments(order: Order): Promise<Payment[]> {
    if (!order.payments || order.payments.length <= 0) {
      return [];
    }

    let payments: Payment[];

    try {
      payments = await this.paymentStorage.getMany(order.payments);
    } catch {
      throw new BlError("one or more payments was not found");
    }

    return await this.confirmAllPayments(order, payments);
  }

  private async confirmAllPayments(
    order: Order,
    payments: Payment[],
  ): Promise<Payment[]> {
    await this.validateOrderAmount(order, payments);
    this.validatePaymentMethods(payments);

    for (const payment of payments) {
      if (payment.confirmed) {
        continue;
      }

      await this.confirmPayment(order, payment);
      await this.paymentStorage.update(payment.id, { confirmed: true });
    }
    return payments;
  }

  private confirmPayment(order: Order, payment: Payment): Promise<boolean> {
    if (payment.method === "dibs") {
      return this.confirmMethodDibs(order, payment);
    }

    if (["card", "cash", "vipps"].includes(payment.method)) {
      if (order.byCustomer) {
        throw new BlError(
          `payment method "${payment.method}" is not permitted for customer`,
        );
      }
      return Promise.resolve(true);
    }

    return Promise.reject(
      new BlError(`payment method "${payment.method}" not supported`),
    );
  }

  private validatePaymentMethods(payments: Payment[]) {
    if (payments.length > 1) {
      for (const payment of payments) {
        if (payment.method == "dibs") {
          throw new BlError(
            `multiple payments found but "${payment.id}" have method dibs`,
          );
        }
      }
    }
    return true;
  }

  private async validateOrderAmount(
    order: Order,
    payments: Payment[],
  ): Promise<boolean> {
    const total = payments.reduce(
      (subTotal, payment) => subTotal + payment.amount,
      0,
    );
    let orderTotal = order.amount;

    if (order.delivery) {
      const delivery = await this.deliveryStorage.get(order.delivery);
      orderTotal += delivery.amount;
    }

    if (total !== orderTotal) {
      throw new BlError(
        "total of payment amounts does not equal order.amount + delivery.amount",
      );
    }

    return true;
  }

  private async confirmMethodDibs(
    order: Order,
    payment: Payment,
  ): Promise<boolean> {
    return this.paymentDibsConfirmer.confirm(order, payment);
  }
}
