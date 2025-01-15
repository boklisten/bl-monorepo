import { DeliveryModel } from "@backend/collections/delivery/delivery.model";
import { OrderModel } from "@backend/collections/order/order.model";
import { PaymentModel } from "@backend/collections/payment/payment.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { DibsEasyOrder } from "@backend/payment/dibs/dibs-easy-order/dibs-easy-order";
import { DibsPaymentService } from "@backend/payment/dibs/dibs-payment.service";
import { BlStorage } from "@backend/storage/blStorage";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class PaymentDibsHandler {
  private paymentStorage: BlStorage<Payment>;
  private orderStorage: BlStorage<Order>;
  private dibsPaymentService: DibsPaymentService;
  private deliveryStorage: BlStorage<Delivery>;
  private userDetailStorage: BlStorage<UserDetail>;

  constructor(
    paymentStorage?: BlStorage<Payment>,
    orderStorage?: BlStorage<Order>,
    dibsPaymentService?: DibsPaymentService,
    deliveryStorage?: BlStorage<Delivery>,
    userDetailStorage?: BlStorage<UserDetail>,
  ) {
    this.paymentStorage = paymentStorage
      ? paymentStorage
      : new BlStorage(PaymentModel);
    this.orderStorage = orderStorage ? orderStorage : new BlStorage(OrderModel);
    this.dibsPaymentService = dibsPaymentService
      ? dibsPaymentService
      : new DibsPaymentService();
    this.deliveryStorage = deliveryStorage
      ? deliveryStorage
      : new BlStorage(DeliveryModel);
    this.userDetailStorage = userDetailStorage
      ? userDetailStorage
      : new BlStorage(UserDetailModel);
  }

  public async handleDibsPayment(payment: Payment): Promise<Payment> {
    const order = await this.orderStorage.get(payment.order);
    const userDetail = await this.userDetailStorage.get(payment.customer);
    const dibsEasyOrder: DibsEasyOrder = await this.getDibsEasyOrder(
      userDetail,
      order,
    );
    const paymentId = await this.dibsPaymentService.getPaymentId(dibsEasyOrder);
    return await this.paymentStorage.update(payment.id, {
      info: { paymentId: paymentId },
    });
  }

  private getDibsEasyOrder(
    userDetail: UserDetail,
    order: Order,
  ): Promise<DibsEasyOrder> {
    if (order.delivery) {
      return this.deliveryStorage
        .get(order.delivery)
        .then((delivery: Delivery) => {
          return this.dibsPaymentService.orderToDibsEasyOrder(
            userDetail,
            order,
            delivery,
          );
        });
    }
    return Promise.resolve(
      this.dibsPaymentService.orderToDibsEasyOrder(userDetail, order),
    );
  }
}
