import {
  AccessToken,
  BlError,
  Order,
  Payment,
  Delivery,
} from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { deliverySchema } from "@/collections/delivery/delivery.schema";
import { PaymentDibsConfirmer } from "@/collections/payment/helpers/dibs/payment-dibs-confirmer";
import { paymentSchema } from "@/collections/payment/payment.schema";
import { UserDetailHelper } from "@/collections/user-detail/helpers/user-detail.helper";
import { DibsPaymentService } from "@/payment/dibs/dibs-payment.service";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class PaymentHandler {
  private paymentStorage: BlDocumentStorage<Payment>;

  constructor(
    paymentStorage?: BlDocumentStorage<Payment>,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dibsPaymentService?: DibsPaymentService,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    userDetailHelper?: UserDetailHelper,
    private _paymentDibsConfirmer?: PaymentDibsConfirmer,
    private _deliveryStorage?: BlDocumentStorage<Delivery>,
  ) {
    this.paymentStorage = paymentStorage
      ? paymentStorage
      : new BlDocumentStorage(BlCollectionName.Payments, paymentSchema);
    this._paymentDibsConfirmer = _paymentDibsConfirmer
      ? _paymentDibsConfirmer
      : new PaymentDibsConfirmer();
    this._deliveryStorage = _deliveryStorage
      ? _deliveryStorage
      : new BlDocumentStorage(BlCollectionName.Deliveries, deliverySchema);
  }

  public async confirmPayments(
    order: Order,
    accessToken: AccessToken,
  ): Promise<Payment[]> {
    if (!order.payments || order.payments.length <= 0) {
      return [];
    }

    let payments: Payment[];

    try {
      payments = await this.paymentStorage.getMany(order.payments);
    } catch {
      throw new BlError("one or more payments was not found");
    }

    return await this.confirmAllPayments(order, payments, accessToken);
  }

  private async confirmAllPayments(
    order: Order,
    payments: Payment[],
    accessToken: AccessToken,
  ): Promise<Payment[]> {
    await this.validateOrderAmount(order, payments);
    this.validatePaymentMethods(payments);

    for (const payment of payments) {
      if (payment.confirmed) {
        continue;
      }

      await this.confirmPayment(order, payment, accessToken);
      await this.paymentStorage.update(
        payment.id,
        { confirmed: true },
        { id: accessToken.sub, permission: accessToken.permission },
      );
    }
    return payments;
  }

  private confirmPayment(
    order: Order,
    payment: Payment,
    accessToken: AccessToken,
  ): Promise<boolean> {
    switch (payment.method) {
      case "dibs":
        return this.confirmMethodDibs(order, payment, accessToken);
      case "card":
        return this.confirmMethodCard(order, payment);
      case "cash":
        return this.confirmMethodCash(order, payment);
      case "vipps":
        return this.confirmMethodVipps(order, payment);
      default:
        return Promise.reject(
          new BlError(`payment method "${payment.method}" not supported`),
        );
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private confirmMethodCard(order: Order, payment: Payment): Promise<boolean> {
    if (order.byCustomer) {
      throw new BlError('payment method "card" is not permitted for customer');
    }
    return Promise.resolve(true);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private confirmMethodVipps(order: Order, payment: Payment): Promise<boolean> {
    if (order.byCustomer) {
      throw new BlError('payment method "vipps" is not permitted for customer');
    }
    return Promise.resolve(true);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private confirmMethodCash(order: Order, payment: Payment): Promise<boolean> {
    if (order.byCustomer) {
      throw new BlError('payment method "cash" is not permitted for customer');
    }
    return Promise.resolve(true);
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    order,
    payments: Payment[],
  ): Promise<boolean> {
    const total = payments.reduce(
      (subTotal, payment) => subTotal + payment.amount,
      0,
    );
    let orderTotal = order.amount;

    if (order.delivery) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const delivery = await this._deliveryStorage.get(order.delivery);
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
    accessToken: AccessToken,
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this._paymentDibsConfirmer.confirm(order, payment, accessToken);
  }
}
