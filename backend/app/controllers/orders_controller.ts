import { HttpContext } from "@adonisjs/core/http";
import { ObjectId } from "mongodb";

import { OrderItemMovedFromOrderHandler } from "#services/legacy/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { OrderItem } from "#shared/order/order-item/order-item";
import { cancelOrderItemValidator } from "#validators/cancel_order_item_validator";

export default class OrdersController {
  async getOpenOrders(ctx: HttpContext) {
    const { detailsId } = PermissionService.authenticate(ctx);

    return (await StorageService.Orders.aggregate([
      {
        $match: {
          customer: new ObjectId(detailsId),
          placed: true,
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
          "orderItems.type": { $in: ["rent", "partly-payment"] },
          "orderItems.movedToOrder": null,
          "orderItems.movedFromOrder": null,
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
          cancelable: { $eq: ["$amount", 0] },
        },
      },
    ])) as {
      orderId: string;
      itemId: string;
      title: string;
      deadline: string;
      cancelable: boolean;
    }[];
  }

  async cancelOrderItem(ctx: HttpContext) {
    const { orderId, itemId } = await ctx.request.validateUsing(
      cancelOrderItemValidator,
    );
    const order = await StorageService.Orders.get(orderId);
    if (!order) {
      return ctx.response.notFound();
    }
    const findOrderItem = (oi: OrderItem) =>
      oi.item === itemId && !oi.movedToOrder && !oi.movedFromOrder;
    const orderItem = order.orderItems.find(findOrderItem);

    if (!orderItem) {
      return ctx.response.notFound();
    }

    const cancelOrder = await StorageService.Orders.add({
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
