import moment from "moment-timezone";

import { SEDbQueryBuilder } from "#services/query/se.db-query-builder";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { Branch } from "#shared/branch/branch";
import { CustomerItem } from "#shared/customer-item/customer-item";
import { OrderItem } from "#shared/order/order-item/order-item";
import { Period } from "#shared/period/period";

export class CustomerItemHandler {
  /**
   * Extends the deadline of a customer item
   * @param customerItemId
   * @param orderItem
   */
  public async extend(
    customerItemId: string,
    orderItem: OrderItem,
    branchId: string,
    orderId: string,
  ): Promise<CustomerItem> {
    const customerItem = await BlStorage.CustomerItems.get(customerItemId);

    if (customerItem.returned) {
      throw new BlError("can not extend when returned is true");
    }

    if (orderItem.type !== "extend") {
      throw new BlError('orderItem.type is not "extend"');
    }

    if (!orderItem.info || !orderItem.info["periodType"]) {
      throw new BlError('orderItem info is not present when type is "extend"');
    }

    const branch = await BlStorage.Branches.get(branchId);

    this.getExtendPeriod(branch, orderItem.info["periodType"]);

    const periodExtends = customerItem.periodExtends ?? [];

    const customerItemOrders = customerItem.orders ?? [];

    periodExtends.push({
      // @ts-expect-error fixme: auto ignored
      from: orderItem.info["from"],

      // @ts-expect-error fixme: auto ignored
      to: orderItem.info["to"],
      periodType: orderItem.info["periodType"],
      time: new Date(),
    });

    customerItemOrders.push(orderId);
    return await BlStorage.CustomerItems.update(customerItemId, {
      deadline: orderItem.info["to"],
      periodExtends: periodExtends,
      orders: customerItemOrders,
    });
  }

  /**
   * Buyouts a customer item
   * @param customerItemId
   * @param orderId
   * @param orderItem
   */
  public async buyout(
    customerItemId: string,
    orderId: string,
    orderItem: OrderItem,
  ) {
    if (orderItem.type !== "buyout") {
      throw `orderItem.type is not "buyout"`;
    }

    const customerItem = await BlStorage.CustomerItems.get(customerItemId);
    const customerItemOrders = customerItem.orders ?? [];

    customerItemOrders.push(orderId);

    return await BlStorage.CustomerItems.update(customerItemId, {
      buyout: true,
      orders: customerItemOrders,
      buyoutInfo: {
        order: orderId,
        time: new Date(),
      },
    });
  }

  /**
   * Returns a customer item
   * @param customerItemId
   * @param orderId
   * @param orderItem
   */
  public async return(
    customerItemId: string,
    orderId: string,
    orderItem: OrderItem,
    branchId: string,
    employeeId: string,
  ) {
    if (orderItem.type !== "return") {
      throw `orderItem.type is not "return"`;
    }

    const customerItem = await BlStorage.CustomerItems.get(customerItemId);

    const customerItemOrders = customerItem.orders ?? [];

    customerItemOrders.push(orderId);

    return await BlStorage.CustomerItems.update(customerItemId, {
      returned: true,
      orders: customerItemOrders,
      returnInfo: {
        returnedTo: "branch",
        returnedToId: branchId,
        returnEmployee: employeeId,
        time: new Date(),
      },
    });
  }

  /**
   * Cancels a customer item
   * @param customerItemId
   * @param orderId
   * @param orderItem
   */
  public async cancel(
    customerItemId: string,
    orderId: string,
    orderItem: OrderItem,
  ) {
    if (orderItem.type !== "cancel") {
      throw `orderItem.type is not "cancel"`;
    }

    const customerItem = await BlStorage.CustomerItems.get(customerItemId);

    const customerItemOrders = customerItem.orders ?? [];

    customerItemOrders.push(orderId);

    return await BlStorage.CustomerItems.update(customerItemId, {
      returned: true,
      orders: customerItemOrders,
      cancel: true,
      cancelInfo: {
        time: new Date(),
        order: orderId,
      },
    });
  }

  /**
   * Buyback a customer item
   * @param customerItemId
   * @param orderId
   * @param orderItem
   */
  public async buyback(
    customerItemId: string,
    orderId: string,
    orderItem: OrderItem,
  ) {
    if (orderItem.type !== "buyback") {
      throw `orderItem.type is not "buyback"`;
    }

    const customerItem = await BlStorage.CustomerItems.get(customerItemId);
    const customerItemOrders = customerItem.orders ?? [];

    customerItemOrders.push(orderId);

    return await BlStorage.CustomerItems.update(customerItemId, {
      returned: true,
      orders: customerItemOrders,
      buyback: true,
      buybackInfo: {
        order: orderId,
      },
    });
  }

  /**
   * Fetches a customers customerItems not returned for the specified deadline
   * @param customerId the customer to look for
   * @param deadline the deadline of the customerItem
   */
  public async getNotReturned(
    customerId: string,
    deadline: Date,
    type?: "partly-payment" | "rent" | "loan" | "all",
  ): Promise<CustomerItem[]> {
    if (customerId == null || customerId.length <= 0) {
      throw new BlError("customerId is null or undefined");
    }

    if (deadline == null) {
      throw new BlError("deadline is null or undefined");
    }

    const before = moment
      .tz(deadline, "Europe/London")
      .subtract(2, "day")
      .format("DDMMYYYYHHmm");

    const after = moment
      .tz(deadline, "Europe/London")
      .add(2, "day")
      .format("DDMMYYYYHHmm");

    let query;

    const databaseQueryBuilder = new SEDbQueryBuilder();
    let databaseQuery;

    if (type) {
      if (type === "loan") {
        type = "rent";
      }
      query = {
        customer: customerId.toString(),
        deadline: [">" + before, "<" + after],
        returned: "false",
        buyout: "false",
        type: type,
      };

      databaseQuery = databaseQueryBuilder.getDbQuery(query, [
        { fieldName: "customer", type: "object-id" },
        { fieldName: "deadline", type: "date" },
        { fieldName: "returned", type: "boolean" },
        { fieldName: "match", type: "boolean" },
        { fieldName: "buyout", type: "boolean" },
        { fieldName: "type", type: "string" },
      ]);
    } else {
      query = {
        customer: customerId.toString(),
        deadline: [">" + before, "<" + after],
        returned: "false",
        buyout: "false",
      };

      databaseQuery = databaseQueryBuilder.getDbQuery(query, [
        { fieldName: "customer", type: "object-id" },
        { fieldName: "deadline", type: "date" },
        { fieldName: "returned", type: "boolean" },
        { fieldName: "match", type: "boolean" },
        { fieldName: "buyout", type: "boolean" },
      ]);
    }

    return await BlStorage.CustomerItems.getByQuery(databaseQuery);
  }

  private getExtendPeriod(
    branch: Branch,
    period: Period,
  ): { type: Period; date: Date; maxNumberOfPeriods: number; price: number } {
    // @ts-expect-error fixme: auto ignored
    if (!branch.paymentInfo.extendPeriods) {
      throw new BlError("no extend periods present on branch");
    }

    // @ts-expect-error fixme: auto ignored
    for (const extendPeriod of branch.paymentInfo.extendPeriods) {
      if (extendPeriod.type === period) {
        return extendPeriod;
      }
    }

    throw new BlError(`extend period "${period}" is not present on branch`);
  }
}
