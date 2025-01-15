import { CustomerItemHandler } from "@backend/collections/customer-item/helpers/customer-item-handler";
import { OrderItemMovedFromOrderHandler } from "@backend/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { OrderModel } from "@backend/collections/order/order.model";
import { PaymentHandler } from "@backend/collections/payment/helpers/payment-handler";
import { userHasValidSignature } from "@backend/collections/signature/helpers/signature.helper";
import { SignatureModel } from "@backend/collections/signature/signature.model";
import { Signature } from "@backend/collections/signature/signature.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { logger } from "@backend/logger/logger";
import { Messenger } from "@backend/messenger/messenger";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { OrderItem } from "@shared/order/order-item/order-item";
import { OrderItemType } from "@shared/order/order-item/order-item-type";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class OrderPlacedHandler {
  private orderStorage: BlStorage<Order>;
  private paymentHandler: PaymentHandler;
  private userDetailStorage: BlStorage<UserDetail>;
  private signatureStorage: BlStorage<Signature>;
  private customerItemHandler: CustomerItemHandler;
  private orderItemMovedFromOrderHandler: OrderItemMovedFromOrderHandler;
  private messenger: Messenger;

  constructor(
    orderStorage?: BlStorage<Order>,
    paymentHandler?: PaymentHandler,
    userDetailStorage?: BlStorage<UserDetail>,
    messenger?: Messenger,
    customerItemHandler?: CustomerItemHandler,
    orderItemMovedFromOrderHandler?: OrderItemMovedFromOrderHandler,
    signatureStorage?: BlStorage<Signature>,
  ) {
    this.orderStorage = orderStorage ?? new BlStorage(OrderModel);
    this.paymentHandler = paymentHandler ?? new PaymentHandler();
    this.userDetailStorage =
      userDetailStorage ?? new BlStorage(UserDetailModel);
    this.messenger = messenger ?? new Messenger();
    this.customerItemHandler = customerItemHandler ?? new CustomerItemHandler();
    this.orderItemMovedFromOrderHandler =
      orderItemMovedFromOrderHandler ?? new OrderItemMovedFromOrderHandler();
    this.signatureStorage = signatureStorage ?? new BlStorage(SignatureModel);
  }

  public async placeOrder(
    order: Order,
    accessToken: AccessToken,
  ): Promise<Order> {
    try {
      const pendingSignature = await this.isSignaturePending(order);

      const payments = await this.paymentHandler.confirmPayments(order);

      const paymentIds = payments.map((payment) => payment.id);

      const placedOrder = await this.orderStorage.update(order.id, {
        placed: true,
        payments: paymentIds,
        pendingSignature,
      });

      await this.updateCustomerItemsIfPresent(placedOrder, accessToken);
      await this.orderItemMovedFromOrderHandler.updateOrderItems(placedOrder);
      await this.updateUserDetailWithPlacedOrder(placedOrder);
      // Don't await to improve performance
      this.sendOrderConfirmationMail(placedOrder).catch((error) =>
        logger.warn(`could not send order confirmation mail: ${error}`),
      );

      return placedOrder;
    } catch (error) {
      // @ts-expect-error fixme: auto ignored
      throw new BlError("could not update order: " + error).add(error);
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
          switch (orderItem.type) {
            case "extend": {
              await this.customerItemHandler.extend(
                customerItemId,
                orderItem,
                order.branch,
                order.id,
              );

              break;
            }
            case "buyout": {
              await this.customerItemHandler.buyout(
                customerItemId,
                order.id,
                orderItem,
              );

              break;
            }
            case "buyback": {
              await this.customerItemHandler.buyback(
                customerItemId,
                order.id,
                orderItem,
              );

              break;
            }
            case "cancel": {
              await this.customerItemHandler.cancel(
                customerItemId,
                order.id,
                orderItem,
              );

              break;
            }
            case "return": {
              await this.customerItemHandler.return(
                customerItemId,
                order.id,
                orderItem,
                order.branch,
                accessToken.details,
              );

              break;
            }
            // No default
          }
        }
      }
    }

    return order;
  }

  private updateUserDetailWithPlacedOrder(order: Order): Promise<boolean> {
    if (!order?.customer) {
      return Promise.resolve(true);
    }
    return new Promise((resolve, reject) => {
      this.userDetailStorage
        .get(order.customer)
        .then((userDetail: UserDetail) => {
          const orders = userDetail.orders ?? [];

          if (orders.includes(order.id)) {
            resolve(true);
          } else {
            orders.push(order.id);

            this.userDetailStorage
              .update(order.customer, { orders })
              .then(() => {
                resolve(true);
              })
              .catch(() => {
                reject(
                  new BlError("could not update userDetail with placed order"),
                );
              });
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
    await (order.handoutByDelivery
      ? this.messenger.sendDeliveryInformation(customerDetail, order)
      : this.messenger.orderPlaced(customerDetail, order));
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
      this.signatureStorage,
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
        // fixme: remove this return and uncomment throw to enforce signature
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
