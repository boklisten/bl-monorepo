import { DibsEasyOrder } from "@backend/payment/dibs/dibs-easy-order/dibs-easy-order";
import { DibsPaymentService } from "@backend/payment/dibs/dibs-payment.service";
import { BlStorage } from "@backend/storage/bl-storage";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class PaymentDibsHandler {
  private dibsPaymentService: DibsPaymentService;

  constructor(dibsPaymentService?: DibsPaymentService) {
    this.dibsPaymentService = dibsPaymentService
      ? dibsPaymentService
      : new DibsPaymentService();
  }

  public async handleDibsPayment(payment: Payment): Promise<Payment> {
    const order = await BlStorage.Orders.get(payment.order);
    const userDetail = await BlStorage.UserDetails.get(payment.customer);
    const dibsEasyOrder: DibsEasyOrder = await this.getDibsEasyOrder(
      userDetail,
      order,
    );
    const paymentId = await this.dibsPaymentService.getPaymentId(dibsEasyOrder);
    return await BlStorage.Payments.update(payment.id, {
      info: { paymentId: paymentId },
    });
  }

  private getDibsEasyOrder(
    userDetail: UserDetail,
    order: Order,
  ): Promise<DibsEasyOrder> {
    if (order.delivery) {
      return BlStorage.Deliveries.get(order.delivery).then(
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
