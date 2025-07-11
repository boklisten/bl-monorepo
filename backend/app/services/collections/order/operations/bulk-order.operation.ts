import { ObjectId } from "mongodb";

import { OrderValidator } from "#services/collections/order/helpers/order-validator/order-validator";
import { BlStorage } from "#services/storage/bl-storage";
import { Operation } from "#services/types/operation";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";

// fixme: rewrite and generalize this for use in the future
export class BulkOrderOperation implements Operation {
  async run(): Promise<BlapiResponse> {
    const samf = await BlStorage.Items.get("5ee37e644127df001c112ae0");
    const geo = await BlStorage.Items.get("5ee37e644127df001c112af9");

    const result = (await BlStorage.CustomerItems.aggregate([
      {
        $match: {
          returned: false,
          buyback: false,
          buyout: false,
          cancel: false,
          deadline: { $lt: new Date("2025-02-01"), $gt: new Date() },
          item: {
            $in: [
              new ObjectId("5ee37e644127df001c112af9"),
              new ObjectId("5ee37e644127df001c112ae0"),
            ],
          },
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "handoutInfo.handoutById",
          foreignField: "_id",
          as: "branchInfo",
        },
      },
      {
        $unwind: {
          path: "$branchInfo",
        },
      },
      {
        $match: {
          "branchInfo.name": { $regex: "Ullern VG" },
        },
      },
      {
        $group: {
          _id: "$customer",
          branch: { $last: "$branchInfo._id" },
          items: { $addToSet: "$item" },
        },
      },
      {
        $project: {
          customer: "$_id",
          branch: 1,
          prevItems: "$items",
        },
      },
    ])) as {
      customer: string;
      branch: string;
      prevItems: string[];
    }[];
    await Promise.all(
      result.map(async ({ customer, branch, prevItems }) => {
        if (prevItems.length > 1) {
          return;
        }
        const prevItem = prevItems[0];
        let item;
        if (prevItem === geo.id) {
          item = samf;
        } else if (prevItem === samf.id) {
          item = geo;
        } else {
          throw new BlError("something wrong!!, " + prevItem);
        }
        const placedHandoutOrder = await BlStorage.Orders.add({
          placed: true,
          payments: [],
          amount: 0,
          branch: branch,
          customer: customer,
          byCustomer: true,
          pendingSignature: false,
          orderItems: [
            {
              item: item.id,
              title: item.title,
              type: "rent",
              amount: 0,
              unitPrice: 0,
              taxRate: 0,
              taxAmount: 0,
              info: {
                from: new Date(),
                to: new Date("2025-07-01"),
                numberOfPeriods: 1,
                periodType: "year",
              },
            },
          ],
        });

        await new OrderValidator().validate(placedHandoutOrder, false);
      }),
    );
    return new BlapiResponse([{}]);
  }
}
