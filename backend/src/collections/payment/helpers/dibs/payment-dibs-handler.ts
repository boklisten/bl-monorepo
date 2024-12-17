import { BlCollectionName } from "@backend/collections/bl-collection";
import { deliverySchema } from "@backend/collections/delivery/delivery.schema";
import { orderSchema } from "@backend/collections/order/order.schema";
import { paymentSchema } from "@backend/collections/payment/payment.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { DibsEasyOrder } from "@backend/payment/dibs/dibs-easy-order/dibs-easy-order";
import { DibsPaymentService } from "@backend/payment/dibs/dibs-payment.service";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class PaymentDibsHandler {
  private paymentStorage: BlDocumentStorage<Payment>;
  private orderStorage: BlDocumentStorage<Order>;
  private dibsPaymentService: DibsPaymentService;
  private deliveryStorage: BlDocumentStorage<Delivery>;
  private userDetailStorage: BlDocumentStorage<UserDetail>;

  constructor(
    paymentStorage?: BlDocumentStorage<Payment>,
    orderStorage?: BlDocumentStorage<Order>,
    dibsPaymentService?: DibsPaymentService,
    deliveryStorage?: BlDocumentStorage<Delivery>,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
  ) {
    this.paymentStorage = paymentStorage
      ? paymentStorage
      : new BlDocumentStorage(BlCollectionName.Payments, paymentSchema);
    this.orderStorage = orderStorage
      ? orderStorage
      : new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this.dibsPaymentService = dibsPaymentService
      ? dibsPaymentService
      : new DibsPaymentService();
    this.deliveryStorage = deliveryStorage
      ? deliveryStorage
      : new BlDocumentStorage(BlCollectionName.Deliveries, deliverySchema);
    this.userDetailStorage = userDetailStorage
      ? userDetailStorage
      : new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
  }

  public async handleDibsPayment(
    payment: Payment,
    accessToken: AccessToken,
  ): Promise<Payment> {
    const order = await this.orderStorage.get(payment.order);
    const userDetail = await this.userDetailStorage.get(payment.customer);
    const dibsEasyOrder: DibsEasyOrder = await this.getDibsEasyOrder(
      userDetail,
      order,
    );
    const paymentId = await this.dibsPaymentService.getPaymentId(dibsEasyOrder);
    return await this.paymentStorage.update(
      payment.id,
      { info: { paymentId: paymentId } },
      { id: accessToken.sub, permission: accessToken.permission },
    );
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
