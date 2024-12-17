import { BlCollectionName } from "@backend/collections/bl-collection";
import { paymentSchema } from "@backend/collections/payment/payment.schema";
import { isNullish } from "@backend/helper/typescript-helpers";
import { DibsEasyPayment } from "@backend/payment/dibs/dibs-easy-payment/dibs-easy-payment";
import { DibsPaymentService } from "@backend/payment/dibs/dibs-payment.service";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { AccessToken } from "@shared/token/access-token";

export class PaymentDibsConfirmer {
  constructor(
    private _dibsPaymentService?: DibsPaymentService,
    private _paymentStorage?: BlDocumentStorage<Payment>,
  ) {
    this._dibsPaymentService = _dibsPaymentService
      ? _dibsPaymentService
      : new DibsPaymentService();
    this._paymentStorage = _paymentStorage
      ? _paymentStorage
      : new BlDocumentStorage(BlCollectionName.Payments, paymentSchema);
  }

  public async confirm(
    order: Order,
    payment: Payment,
    accessToken: AccessToken,
  ): Promise<boolean> {
    let dibsEasyPaymentDetails;
    if (payment.amount >= 0) {
      this.validatePaymentInfo(payment);

      try {
        dibsEasyPaymentDetails =
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await this._dibsPaymentService.fetchDibsPaymentData(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            payment.info["paymentId"],
          );
      } catch (getDibsPaymentError) {
        throw new BlError("could not get dibs payment from dibs api").add(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          getDibsPaymentError,
        );
      }

      this.validateDibsEasyPayment(order, payment, dibsEasyPaymentDetails);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this._paymentStorage.update(
        payment.id,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { info: dibsEasyPaymentDetails },
        { id: accessToken.details, permission: accessToken.permission },
      );
    } catch (e) {
      throw new BlError(
        "payment could not be updated with dibs information:" + e,
      );
    }

    return true;
  }

  private validateDibsEasyPayment(
    order: Order,
    payment: Payment,
    dibsEasyPaymentDetails: DibsEasyPayment,
  ): boolean {
    if (
      isNullish(dibsEasyPaymentDetails.orderDetails) ||
      dibsEasyPaymentDetails.orderDetails.reference !== order.id
    ) {
      throw new BlError(
        "dibsEasyPaymentDetails.orderDetails.reference is not equal to order.id",
      );
    }

    if (
      isNullish(dibsEasyPaymentDetails.summary) ||
      isNullish(dibsEasyPaymentDetails.summary.reservedAmount) ||
      parseInt("" + dibsEasyPaymentDetails.summary.reservedAmount, 10) !==
        payment.amount * 100
    ) {
      throw new BlError(
        `dibsEasyPaymentDetails.summary.reservedAmount "${
          dibsEasyPaymentDetails.summary.reservedAmount
        }" is not equal to payment.amount "${payment.amount * 100}"`,
      );
    }
    return false;
  }

  private validatePaymentInfo(payment: Payment): boolean {
    if (
      isNullish(payment.info) ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      isNullish(payment.info["paymentId"])
    ) {
      throw new BlError(
        'payment.method is "dibs" but payment.info.paymentId is undefined',
      );
    }

    return true;
  }
}
