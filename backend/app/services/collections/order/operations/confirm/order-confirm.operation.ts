import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Order } from "@shared/order/order.js";
import { AccessToken } from "@shared/token/access-token.js";

import { OrderPlacedHandler } from "#services/collections/order/helpers/order-placed-handler/order-placed-handler";
import { SEDbQueryBuilder } from "#services/query/se.db-query-builder";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";

export class OrderConfirmOperation implements Operation {
  private queryBuilder = new SEDbQueryBuilder();
  private orderPlacedHandler: OrderPlacedHandler;

  constructor(orderPlacedHandler?: OrderPlacedHandler) {
    this.orderPlacedHandler = orderPlacedHandler ?? new OrderPlacedHandler();
  }

  private filterOrdersByAlreadyOrdered(orders: Order[]) {
    const customerOrderItems = [];

    for (const order of orders) {
      if (order.orderItems) {
        for (const orderItem of order.orderItems) {
          if (order.handoutByDelivery || !order.byCustomer) {
            continue;
          }

          if (orderItem.handout) {
            continue;
          }

          if (orderItem.movedToOrder) {
            continue;
          }

          if (
            orderItem.type === "rent" ||
            orderItem.type === "buy" ||
            orderItem.type === "partly-payment"
          ) {
            customerOrderItems.push(orderItem);
          }
        }
      }
    }
    return customerOrderItems;
  }

  private async hasOpenOrderWithOrderItems(order: Order) {
    const databaseQuery = this.queryBuilder.getDbQuery(
      { customer: order.customer, placed: "true" },
      [
        { fieldName: "customer", type: "object-id" },
        { fieldName: "placed", type: "boolean" },
      ],
    );

    try {
      const existingOrders = await BlStorage.Orders.getByQuery(databaseQuery);
      const alreadyOrderedItems =
        this.filterOrdersByAlreadyOrdered(existingOrders);

      for (const orderItem of order.orderItems) {
        for (const alreadyOrderedItem of alreadyOrderedItems) {
          if (
            orderItem.item === alreadyOrderedItem.item &&
            // @ts-expect-error fixme: auto ignored
            orderItem.info.to === alreadyOrderedItem.info.to
          ) {
            return true;
          }
        }
      }
    } catch {
      console.log("could not get user orders");
    }

    return false;
  }

  public async run(blApiRequest: BlApiRequest) {
    const accessToken = {
      // @ts-expect-error fixme: auto ignored
      details: blApiRequest.user.id,
      // @ts-expect-error fixme: auto ignored
      permission: blApiRequest.user.permission,
    } as AccessToken;

    let order;

    try {
      order = await BlStorage.Orders.get(blApiRequest.documentId);
    } catch {
      throw new BlError(`order "${blApiRequest.documentId}" not found`);
    }

    const alreadyOrderedSomeItems =
      await this.hasOpenOrderWithOrderItems(order);

    if (alreadyOrderedSomeItems) {
      throw new BlError(
        "There already exists an order with some of these orderitems",
      );
    }

    let placedOrder;

    try {
      placedOrder = await this.orderPlacedHandler.placeOrder(
        order,
        accessToken,
      );
    } catch (error) {
      throw new BlError("order could not be placed:" + error);
    }
    return new BlapiResponse([placedOrder]);
  }
}
