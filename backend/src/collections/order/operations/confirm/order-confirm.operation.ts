import { OrderPlacedHandler } from "@backend/collections/order/helpers/order-placed-handler/order-placed-handler";
import { OrderModel } from "@backend/collections/order/order.model";
import { Operation } from "@backend/operation/operation";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Order } from "@shared/order/order";
import { AccessToken } from "@shared/token/access-token";
import { Request, Response } from "express";

export class OrderConfirmOperation implements Operation {
  private queryBuilder = new SEDbQueryBuilder();
  private resHandler: SEResponseHandler;
  private orderStorage: BlStorage<Order>;
  private orderPlacedHandler: OrderPlacedHandler;

  constructor(
    resHandler?: SEResponseHandler,
    orderStorage?: BlStorage<Order>,
    orderPlacedHandler?: OrderPlacedHandler,
  ) {
    this.resHandler = resHandler ?? new SEResponseHandler();
    this.orderStorage = orderStorage ?? new BlStorage(OrderModel);
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
      const existingOrders = await this.orderStorage.getByQuery(databaseQuery);
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

  public async run(
    blApiRequest: BlApiRequest,
    request?: Request,
    res?: Response,
  ): Promise<boolean> {
    const accessToken = {
      // @ts-expect-error fixme: auto ignored
      details: blApiRequest.user.id,

      // @ts-expect-error fixme: auto ignored
      permission: blApiRequest.user.permission,
    } as AccessToken;

    let order;

    try {
      // @ts-expect-error fixme: auto ignored
      order = await this.orderStorage.get(blApiRequest.documentId);
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
    // @ts-expect-error fixme: auto ignored
    this.resHandler.sendResponse(res, new BlapiResponse([placedOrder]));

    return true;
  }
}
