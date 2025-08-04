import logger from "@adonisjs/core/services/logger";

import DispatchService from "#services/dispatch_service";
import { CustomerItemHandler } from "#services/legacy/collections/customer-item/helpers/customer-item-handler";
import { OrderItemMovedFromOrderHandler } from "#services/legacy/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { PaymentHandler } from "#services/legacy/collections/payment/helpers/payment-handler";
import { userHasValidSignature } from "#services/legacy/collections/signature/helpers/signature.helper";
import { StorageService } from "#services/storage_service";
import { AccessToken } from "#shared/access-token";
import { BlError } from "#shared/bl-error";
import { Order } from "#shared/order/order";
import { OrderItem } from "#shared/order/order-item/order-item";
import { OrderItemType } from "#shared/order/order-item/order-item-type";
import { UserDetail } from "#shared/user-detail";

export class OrderPlacedHandler {
  private paymentHandler: PaymentHandler;

  private customerItemHandler: CustomerItemHandler;
  private orderItemMovedFromOrderHandler: OrderItemMovedFromOrderHandler;

  constructor(
    paymentHandler?: PaymentHandler,
    customerItemHandler?: CustomerItemHandler,
    orderItemMovedFromOrderHandler?: OrderItemMovedFromOrderHandler,
  ) {
    this.paymentHandler = paymentHandler ?? new PaymentHandler();

    this.customerItemHandler = customerItemHandler ?? new CustomerItemHandler();
    this.orderItemMovedFromOrderHandler =
      orderItemMovedFromOrderHandler ?? new OrderItemMovedFromOrderHandler();
  }

  public async placeOrder(
    order: Order,
    accessToken: AccessToken,
  ): Promise<Order> {
    try {
      const pendingSignature = await this.isSignaturePending(order);

      const payments = await this.paymentHandler.confirmPayments(order);

      const paymentIds = payments.map((payment) => payment.id);

      const placedOrder = await StorageService.Orders.update(order.id, {
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
      StorageService.UserDetails.get(order.customer)
        .then((userDetail: UserDetail) => {
          const orders = userDetail.orders ?? [];

          if (orders.includes(order.id)) {
            resolve(true);
          } else {
            orders.push(order.id);

            StorageService.UserDetails.update(order.customer, { orders })
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
    const customerDetail = await StorageService.UserDetails.get(order.customer);
    await (order.handoutByDelivery
      ? DispatchService.sendDeliveryInformation(customerDetail, order)
      : DispatchService.orderPlaced(customerDetail, order));
  }

  /**
   * Find out whether an order will require signature to become valid
   *
   * @throws BlError if an orderItem is a handout without a valid signature, which happens if the customer does not
   * have a signature currently and the original order for the item is pending signature.
   */
  public async isSignaturePending(order: Order): Promise<boolean> {
    const userDetail = await StorageService.UserDetails.get(order.customer);

    const hasValidSignature = await userHasValidSignature(userDetail);
    if (hasValidSignature) {
      return false;
    }

    for (const orderItem of this.orderItemsWhichRequireSignature(order)) {
      if (orderItem.handout) {
        if (orderItem.movedFromOrder) {
          const originalOrder = await StorageService.Orders.get(
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
