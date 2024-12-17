import {
  BlError,
  Branch,
  CustomerItem,
  OrderItem,
  Period,
} from "@boklisten/bl-model";
import moment from "moment-timezone";

import { SystemUser } from "@/auth/permission/permission.service";
import { BlCollectionName } from "@/collections/bl-collection";
import { branchSchema } from "@/collections/branch/branch.schema";
import { customerItemSchema } from "@/collections/customer-item/customer-item.schema";
import { SEDbQueryBuilder } from "@/query/se.db-query-builder";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class CustomerItemHandler {
  private _customerItemStorage: BlDocumentStorage<CustomerItem>;
  private _branchStorage: BlDocumentStorage<Branch>;

  constructor(
    customerItemStorage?: BlDocumentStorage<CustomerItem>,
    branchStorage?: BlDocumentStorage<Branch>,
  ) {
    this._customerItemStorage = customerItemStorage
      ? customerItemStorage
      : new BlDocumentStorage(
          BlCollectionName.CustomerItems,
          customerItemSchema,
        );
    this._branchStorage = branchStorage
      ? branchStorage
      : new BlDocumentStorage(BlCollectionName.Branches, branchSchema);
  }

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
    const customerItem = await this._customerItemStorage.get(customerItemId);

    if (customerItem.returned) {
      return Promise.reject(
        new BlError("can not extend when returned is true"),
      );
    }

    if (orderItem.type !== "extend") {
      return Promise.reject(new BlError('orderItem.type is not "extend"'));
    }

    if (!orderItem.info || !orderItem.info["periodType"]) {
      return Promise.reject(
        new BlError('orderItem info is not present when type is "extend"'),
      );
    }

    const branch = await this._branchStorage.get(branchId);

    this.getExtendPeriod(branch, orderItem.info["periodType"]);

    const periodExtends = customerItem.periodExtends ?? [];

    const customerItemOrders = customerItem.orders ?? [];

    periodExtends.push({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      from: orderItem.info["from"],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      to: orderItem.info["to"],
      periodType: orderItem.info["periodType"],
      time: new Date(),
    });

    customerItemOrders.push(orderId);

    return await this._customerItemStorage.update(
      customerItemId,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        deadline: orderItem.info["to"],
        periodExtends: periodExtends,
        orders: customerItemOrders,
      },
      new SystemUser(),
    );
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
      return Promise.reject(`orderItem.type is not "buyout"`);
    }

    const customerItem = await this._customerItemStorage.get(customerItemId);
    const customerItemOrders = customerItem.orders ?? [];

    customerItemOrders.push(orderId);

    return await this._customerItemStorage.update(
      customerItemId,
      {
        buyout: true,
        orders: customerItemOrders,
        buyoutInfo: {
          order: orderId,
          time: new Date(),
        },
      },
      new SystemUser(),
    );
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
      return Promise.reject(`orderItem.type is not "return"`);
    }

    const customerItem = await this._customerItemStorage.get(customerItemId);

    const customerItemOrders = customerItem.orders ?? [];

    customerItemOrders.push(orderId);

    return await this._customerItemStorage.update(
      customerItemId,
      {
        returned: true,
        orders: customerItemOrders,
        returnInfo: {
          returnedTo: "branch",
          returnedToId: branchId,
          returnEmployee: employeeId,
          time: new Date(),
        },
      },
      new SystemUser(),
    );
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
      return Promise.reject(`orderItem.type is not "cancel"`);
    }

    const customerItem = await this._customerItemStorage.get(customerItemId);

    const customerItemOrders = customerItem.orders ?? [];

    customerItemOrders.push(orderId);

    return await this._customerItemStorage.update(
      customerItemId,
      {
        returned: true,
        orders: customerItemOrders,
        cancel: true,
        cancelInfo: {
          time: new Date(),
          order: orderId,
        },
      },
      new SystemUser(),
    );
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
      return Promise.reject(`orderItem.type is not "buyback"`);
    }

    const customerItem = await this._customerItemStorage.get(customerItemId);
    const customerItemOrders = customerItem.orders ?? [];

    customerItemOrders.push(orderId);

    return await this._customerItemStorage.update(
      customerItemId,
      {
        returned: true,
        orders: customerItemOrders,
        buyback: true,
        buybackInfo: {
          order: orderId,
        },
      },
      new SystemUser(),
    );
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

    const dbQueryBuilder = new SEDbQueryBuilder();
    let dbQuery;

    if (type) {
      if (type === "loan") {
        type = "rent";
      }
      query = {
        customer: customerId.toString(),
        deadline: [">" + before, "<" + after],
        returned: "false",
        buyout: "false",
        match: "false",
        type: type,
      };

      dbQuery = dbQueryBuilder.getDbQuery(query, [
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
        match: "false",
        buyout: "false",
      };

      dbQuery = dbQueryBuilder.getDbQuery(query, [
        { fieldName: "customer", type: "object-id" },
        { fieldName: "deadline", type: "date" },
        { fieldName: "returned", type: "boolean" },
        { fieldName: "match", type: "boolean" },
        { fieldName: "buyout", type: "boolean" },
      ]);
    }

    return await this._customerItemStorage.getByQuery(dbQuery);
  }

  private getExtendPeriod(
    branch: Branch,
    period: Period,
  ): { type: Period; date: Date; maxNumberOfPeriods: number; price: number } {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!branch.paymentInfo.extendPeriods) {
      throw new BlError("no extend periods present on branch");
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    for (const extendPeriod of branch.paymentInfo.extendPeriods) {
      if (extendPeriod.type === period) {
        return extendPeriod;
      }
    }

    throw new BlError(`extend period "${period}" is not present on branch`);
  }
}
