import { SEDbQueryBuilder } from "@backend/lib/query/se.db-query-builder.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import moment from "moment-timezone";
export class CustomerItemHandler {
    /**
     * Extends the deadline of a customer item
     * @param customerItemId
     * @param orderItem
     */
    async extend(customerItemId, orderItem, branchId, orderId) {
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
        return await BlStorage.CustomerItems.update(customerItemId, 
        // @ts-expect-error fixme: auto ignored
        {
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
    async buyout(customerItemId, orderId, orderItem) {
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
    async return(customerItemId, orderId, orderItem, branchId, employeeId) {
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
    async cancel(customerItemId, orderId, orderItem) {
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
    async buyback(customerItemId, orderId, orderItem) {
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
    async getNotReturned(customerId, deadline, type) {
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
        }
        else {
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
    getExtendPeriod(branch, period) {
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
