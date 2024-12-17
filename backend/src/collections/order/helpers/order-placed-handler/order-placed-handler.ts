import { BlCollectionName } from "@backend/collections/bl-collection";
import { CustomerItemHandler } from "@backend/collections/customer-item/helpers/customer-item-handler";
import { OrderItemMovedFromOrderHandler } from "@backend/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { orderSchema } from "@backend/collections/order/order.schema";
import { PaymentHandler } from "@backend/collections/payment/helpers/payment-handler";
import { userHasValidSignature } from "@backend/collections/signature/helpers/signature.helper";
import {
  Signature,
  signatureSchema,
} from "@backend/collections/signature/signature.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { logger } from "@backend/logger/logger";
import { Messenger } from "@backend/messenger/messenger";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { OrderItem } from "@shared/order/order-item/order-item";
import { OrderItemType } from "@shared/order/order-item/order-item-type";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class OrderPlacedHandler {
  private readonly orderStorage: BlDocumentStorage<Order>;
  private readonly paymentHandler: PaymentHandler;
  private readonly userDetailStorage: BlDocumentStorage<UserDetail>;
  private readonly _signatureStorage: BlDocumentStorage<Signature>;
  private _customerItemHandler: CustomerItemHandler;
  private _orderItemMovedFromOrderHandler: OrderItemMovedFromOrderHandler;
  private _messenger: Messenger;

  constructor(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    customerItemStorage?: BlDocumentStorage<CustomerItem>,
    orderStorage?: BlDocumentStorage<Order>,
    paymentHandler?: PaymentHandler,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    messenger?: Messenger,
    customerItemHandler?: CustomerItemHandler,
    orderItemMovedFromOrderHandler?: OrderItemMovedFromOrderHandler,
    signatureStorage?: BlDocumentStorage<Signature>,
  ) {
    this.orderStorage =
      orderStorage ??
      new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this.paymentHandler = paymentHandler ?? new PaymentHandler();
    this.userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
    this._messenger = messenger ?? new Messenger();
    this._customerItemHandler =
      customerItemHandler ?? new CustomerItemHandler();
    this._orderItemMovedFromOrderHandler =
      orderItemMovedFromOrderHandler ?? new OrderItemMovedFromOrderHandler();
    this._signatureStorage =
      signatureStorage ??
      new BlDocumentStorage(BlCollectionName.Signatures, signatureSchema);
  }

  public async placeOrder(
    order: Order,
    accessToken: AccessToken,
  ): Promise<Order> {
    try {
      const pendingSignature = await this.isSignaturePending(order);

      const payments = await this.paymentHandler.confirmPayments(
        order,
        accessToken,
      );

      const paymentIds = payments.map((payment) => payment.id);

      const placedOrder = await this.orderStorage.update(
        order.id,
        { placed: true, payments: paymentIds, pendingSignature },
        {
          id: accessToken.sub,
          permission: accessToken.permission,
        },
      );

      await this.updateCustomerItemsIfPresent(placedOrder, accessToken);
      await this._orderItemMovedFromOrderHandler.updateOrderItems(placedOrder);
      await this.updateUserDetailWithPlacedOrder(placedOrder, accessToken);
      // Don't await to improve performance
      this.sendOrderConfirmationMail(placedOrder).catch((e) =>
        logger.warn(`could not send order confirmation mail: ${e}`),
      );

      return placedOrder;
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      throw new BlError("could not update order: " + e).add(e);
    }
  }

  private async updateCustomerItemsIfPresent(
    order: Order,
    accessToken: AccessToken,
  ): Promise<Order> {
    for (const orderItem of order.orderItems) {
      if (
        orderItem.type === "extend" ||
        orderItem.type === "return" ||
        orderItem.type === "buyout" ||
        orderItem.type === "buyback" ||
        orderItem.type === "cancel"
      ) {
        let customerItemId = null;

        if (orderItem.info && orderItem.info.customerItem) {
          customerItemId = orderItem.info.customerItem;
        } else if (orderItem.customerItem) {
          customerItemId = orderItem.customerItem;
        }

        if (customerItemId !== null) {
          if (orderItem.type === "extend") {
            await this._customerItemHandler.extend(
              customerItemId,
              orderItem,
              order.branch,
              order.id,
            );
          } else if (orderItem.type === "buyout") {
            await this._customerItemHandler.buyout(
              customerItemId,
              order.id,
              orderItem,
            );
          } else if (orderItem.type === "buyback") {
            await this._customerItemHandler.buyback(
              customerItemId,
              order.id,
              orderItem,
            );
          } else if (orderItem.type === "cancel") {
            await this._customerItemHandler.cancel(
              customerItemId,
              order.id,
              orderItem,
            );
          } else if (orderItem.type === "return") {
            await this._customerItemHandler.return(
              customerItemId,
              order.id,
              orderItem,
              order.branch,
              accessToken.details,
            );
          }
        }
      }
    }

    return Promise.resolve(order);
  }

  private updateUserDetailWithPlacedOrder(
    order: Order,
    accessToken: AccessToken,
  ): Promise<boolean> {
    if (!order?.customer) {
      return Promise.resolve(true);
    }
    return new Promise((resolve, reject) => {
      this.userDetailStorage
        .get(order.customer)
        .then((userDetail: UserDetail) => {
          const orders = userDetail.orders ?? [];

          if (!orders.includes(order.id)) {
            orders.push(order.id);

            this.userDetailStorage
              .update(
                order.customer,
                { orders },
                { id: accessToken.sub, permission: accessToken.permission },
              )
              .then(() => {
                resolve(true);
              })
              .catch(() => {
                reject(
                  new BlError("could not update userDetail with placed order"),
                );
              });
          } else {
            resolve(true);
          }
        })
        .catch((getUserDetailError: BlError) => {
          reject(
            new BlError(`customer "${order.customer}" not found`).add(
              getUserDetailError,
            ),
          );
        });
    });
  }

  private async sendOrderConfirmationMail(order: Order): Promise<void> {
    if (order.notification && !order.notification.email) {
      return;
    }
    const customerDetail = await this.userDetailStorage.get(order.customer);
    if (order.handoutByDelivery) {
      await this._messenger.sendDeliveryInformation(customerDetail, order);
    } else {
      await this._messenger.orderPlaced(customerDetail, order);
    }
  }

  /**
   * Find out whether an order will require signature to become valid
   *
   * @throws BlError if an orderItem is a handout without a valid signature, which happens if the customer does not
   * have a signature currently and the original order for the item is pending signature.
   */
  public async isSignaturePending(order: Order): Promise<boolean> {
    const userDetail = await this.userDetailStorage.get(order.customer);

    const hasValidSignature = await userHasValidSignature(
      userDetail,
      this._signatureStorage,
    );
    if (hasValidSignature) {
      return false;
    }

    for (const orderItem of this.orderItemsWhichRequireSignature(order)) {
      if (orderItem.handout) {
        if (orderItem.movedFromOrder) {
          const originalOrder = await this.orderStorage.get(
            orderItem.movedFromOrder,
          );
          if (!originalOrder.pendingSignature) continue;
        }
        // TODO: remove this return and uncomment throw to enforce signature
        //       requirement on handout
        return true;
        // throw new BlError(
        //   "Tried to hand out item without active signature",
        // ).code(811);
      } else {
        return true;
      }
    }

    return false;
  }

  private orderItemsWhichRequireSignature(order: Order): OrderItem[] {
    return order.orderItems.filter((orderItem) =>
      orderItemTypesWhichRequireSignature.has(orderItem.type),
    );
  }
}

const orderItemTypesWhichRequireSignature = new Set<OrderItemType>([
  "buy",
  "rent",
  "loan",
]);
