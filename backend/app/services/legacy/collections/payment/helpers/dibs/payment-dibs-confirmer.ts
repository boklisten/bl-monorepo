import { DibsEasyPayment } from "#services/legacy/dibs/dibs-easy-payment/dibs-easy-payment";
import { DibsPaymentService } from "#services/legacy/dibs/dibs-payment.service";
import { isNullish } from "#services/legacy/typescript-helpers";
import { StorageService } from "#services/storage_service";
import { BlError } from "#shared/bl-error";
import { Order } from "#shared/order/order";
import { Payment } from "#shared/payment/payment";

export class PaymentDibsConfirmer {
  private dibsPaymentService: DibsPaymentService;

  constructor(dibsPaymentService?: DibsPaymentService) {
    this.dibsPaymentService = dibsPaymentService ?? new DibsPaymentService();
  }

  public async confirm(order: Order, payment: Payment): Promise<boolean> {
    let dibsEasyPaymentDetails;
    if (payment.amount >= 0) {
      this.validatePaymentInfo(payment);

      try {
        dibsEasyPaymentDetails =
          await this.dibsPaymentService.fetchDibsPaymentData(
            // @ts-expect-error fixme: auto ignored
            payment.info["paymentId"],
          );
      } catch (getDibsPaymentError) {
        throw new BlError("could not get dibs payment from dibs api").add(
          // @ts-expect-error fixme: auto ignored
          getDibsPaymentError,
        );
      }

      this.validateDibsEasyPayment(order, payment, dibsEasyPaymentDetails);
    }

    try {
      await StorageService.Payments.update(payment.id, {
        info: dibsEasyPaymentDetails,
      });
    } catch (error) {
      throw new BlError(
        "payment could not be updated with dibs information:" + error,
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
      Number.parseInt(
        "" + dibsEasyPaymentDetails.summary.reservedAmount,
        10,
      ) !==
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
      // @ts-expect-error fixme: auto ignored
      isNullish(payment.info["paymentId"])
    ) {
      throw new BlError(
        'payment.method is "dibs" but payment.info.paymentId is undefined',
      );
    }

    return true;
  }
}
