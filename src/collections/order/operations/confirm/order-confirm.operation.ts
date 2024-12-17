import {
  AccessToken,
  BlapiResponse,
  BlError,
  Order,
} from "@boklisten/bl-model";
import { NextFunction, Request, Response } from "express";

import { BlCollectionName } from "@/collections/bl-collection";
import { OrderPlacedHandler } from "@/collections/order/helpers/order-placed-handler/order-placed-handler";
import { orderSchema } from "@/collections/order/order.schema";
import { Operation } from "@/operation/operation";
import { SEDbQueryBuilder } from "@/query/se.db-query-builder";
import { BlApiRequest } from "@/request/bl-api-request";
import { SEResponseHandler } from "@/response/se.response.handler";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class OrderConfirmOperation implements Operation {
  private _queryBuilder: SEDbQueryBuilder;
  private readonly _resHandler: SEResponseHandler;
  private readonly _orderStorage: BlDocumentStorage<Order>;
  private readonly _orderPlacedHandler: OrderPlacedHandler;

  constructor(
    resHandler?: SEResponseHandler,
    orderStorage?: BlDocumentStorage<Order>,
    orderPlacedHandler?: OrderPlacedHandler,
  ) {
    this._resHandler = resHandler ?? new SEResponseHandler();

    this._orderStorage =
      orderStorage ??
      new BlDocumentStorage(BlCollectionName.Orders, orderSchema);

    this._orderPlacedHandler = orderPlacedHandler ?? new OrderPlacedHandler();

    this._queryBuilder = new SEDbQueryBuilder();
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
    const dbQuery = this._queryBuilder.getDbQuery(
      { customer: order.customer, placed: "true" },
      [
        { fieldName: "customer", type: "object-id" },
        { fieldName: "placed", type: "boolean" },
      ],
    );

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const existingOrders = await this._orderStorage.getByQuery(dbQuery);
      const alreadyOrderedItems =
        this.filterOrdersByAlreadyOrdered(existingOrders);

      for (const orderItem of order.orderItems) {
        for (const alreadyOrderedItem of alreadyOrderedItems) {
          if (
            orderItem.item === alreadyOrderedItem.item && // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req?: Request,
    res?: Response,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next?: NextFunction,
  ): Promise<boolean> {
    const accessToken = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      details: blApiRequest.user.id,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      permission: blApiRequest.user.permission,
    } as AccessToken;

    let order;

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      order = await this._orderStorage.get(blApiRequest.documentId);
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
      placedOrder = await this._orderPlacedHandler.placeOrder(
        order,
        accessToken,
      );
    } catch (e) {
      throw new BlError("order could not be placed:" + e);
    } // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._resHandler.sendResponse(res, new BlapiResponse([placedOrder]));

    return true;
  }
}
