import { DibsEasyOrder } from "#services/legacy/dibs/dibs-easy-order";
import { DibsPaymentService } from "#services/legacy/dibs/dibs-payment.service";
import { StorageService } from "#services/storage_service";
import { Delivery } from "#shared/delivery/delivery";
import { Order } from "#shared/order/order";
import { Payment } from "#shared/payment/payment";
import { UserDetail } from "#shared/user-detail";

export class PaymentDibsHandler {
  private dibsPaymentService: DibsPaymentService;

  constructor(dibsPaymentService?: DibsPaymentService) {
    this.dibsPaymentService = dibsPaymentService
      ? dibsPaymentService
      : new DibsPaymentService();
  }

  public async handleDibsPayment(payment: Payment): Promise<Payment> {
    const order = await StorageService.Orders.get(payment.order);
    const userDetail = await StorageService.UserDetails.get(payment.customer);
    const dibsEasyOrder: DibsEasyOrder = await this.getDibsEasyOrder(
      userDetail,
      order,
    );
    const paymentId = await this.dibsPaymentService.getPaymentId(dibsEasyOrder);
    return await StorageService.Payments.update(payment.id, {
      info: { paymentId: paymentId },
    });
  }

  private getDibsEasyOrder(
    userDetail: UserDetail,
    order: Order,
  ): Promise<DibsEasyOrder> {
    if (order.delivery) {
      return StorageService.Deliveries.get(order.delivery).then(
        (delivery: Delivery) => {
          return this.dibsPaymentService.orderToDibsEasyOrder(
            userDetail,
            order,
            delivery,
          );
        },
      );
    }
    return Promise.resolve(
      this.dibsPaymentService.orderToDibsEasyOrder(userDetail, order),
    );
  }
}
