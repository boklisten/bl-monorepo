import { HttpContext } from "@adonisjs/core/http";
import { ObjectId } from "mongodb";

import CollectionEndpointAuth from "#services/collection-endpoint/collection-endpoint-auth";
import { OrderItemMovedFromOrderHandler } from "#services/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { BlStorage } from "#services/storage/bl-storage";
import { OrderItem } from "#shared/order/order-item/order-item";
import { cancelOrderItemValidator } from "#validators/cancel_order_item_validator";

export default class OrdersController {
  async getOpenOrders(ctx: HttpContext) {
    let details: string;
    try {
      const accessToken = await CollectionEndpointAuth.authenticate(
        undefined,
        ctx,
      );
      if (!accessToken) {
        return ctx.response.unauthorized();
      }
      details = accessToken["details"];
    } catch {
      return ctx.response.unauthorized();
    }

    return await BlStorage.Orders.aggregate([
      {
        $match: {
          customer: new ObjectId(details),
          placed: true,
          amount: 0,
          byCustomer: true,
        },
      },
      {
        $unwind: {
          path: "$orderItems",
        },
      },
      {
        $match: {
          "orderItems.type": "rent",
          "orderItems.movedToOrder": null,
          "orderItems.movedFromOrder": null,
          "orderItems.delivered": false,
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "orderItems.item",
          foreignField: "_id",
          as: "item",
        },
      },
      {
        $unwind: {
          path: "$item",
        },
      },
      {
        $project: {
          orderId: "$_id",
          itemId: "$orderItems.item",
          title: "$item.title",
          deadline: "$orderItems.info.to",
        },
      },
    ]);
  }

  async cancelOrderItem(ctx: HttpContext) {
    const { orderId, itemId } = await ctx.request.validateUsing(
      cancelOrderItemValidator,
    );
    const order = await BlStorage.Orders.get(orderId);
    if (!order) {
      return ctx.response.notFound();
    }
    const findOrderItem = (oi: OrderItem) =>
      oi.item === itemId && !oi.movedToOrder && !oi.movedFromOrder;
    const orderItem = order.orderItems.find(findOrderItem);

    if (!orderItem) {
      return ctx.response.notFound();
    }

    const cancelOrder = await BlStorage.Orders.add({
      placed: true,
      payments: [],
      amount: 0,
      branch: order.branch,
      customer: order.customer,
      byCustomer: true,
      pendingSignature: false,
      orderItems: [
        {
          movedFromOrder: order.id,
          delivered: true,
          item: itemId,
          title: orderItem.title,
          type: "cancel",
          amount: 0,
          unitPrice: 0,
          taxRate: 0,
          taxAmount: 0,
        },
      ],
    });

    const orderMovedToHandler = new OrderItemMovedFromOrderHandler();
    await orderMovedToHandler.updateOrderItems(cancelOrder);

    return cancelOrder;
  }
}
