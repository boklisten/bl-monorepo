import { SEDbQueryBuilder } from "@backend/lib/query/se.db-query-builder.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class OrderActive {
    queryBuilder = new SEDbQueryBuilder();
    async getActiveOrders(userId) {
        const databaseQuery = this.queryBuilder.getDbQuery({ customer: userId }, [
            { fieldName: "customer", type: "object-id" },
        ]);
        let orders;
        try {
            orders = await BlStorage.Orders.getByQuery(databaseQuery);
        }
        catch (error) {
            if (error instanceof BlError && error.getCode() === 702) {
                return [];
            }
            throw error;
        }
        return orders.filter((order) => this.isOrderActive(order));
    }
    async haveActiveOrders(userId) {
        const activeOrders = await this.getActiveOrders(userId);
        return activeOrders.length > 0;
    }
    isOrderActive(order) {
        return (order.placed === true &&
            order.orderItems.some((orderItem) => this.isOrderItemActive(orderItem)));
    }
    isOrderItemActive(orderItem) {
        return !(orderItem.handout ||
            orderItem.delivered ||
            orderItem.movedToOrder);
    }
}
