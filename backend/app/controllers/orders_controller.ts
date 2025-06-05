import { HttpContext } from "@adonisjs/core/http";
import { ObjectId } from "mongodb";

import CollectionEndpointAuth from "#services/collection-endpoint/collection-endpoint-auth";
import { BlStorage } from "#services/storage/bl-storage";

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
      details = accessToken.details;
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
          itemId: "$orderItems._id",
          title: "$item.title",
          deadline: "$orderItems.info.to",
        },
      },
    ]);
  }

  async cancelOrderItem() {
    console.log("foo");
    return "bar";
  }
}
