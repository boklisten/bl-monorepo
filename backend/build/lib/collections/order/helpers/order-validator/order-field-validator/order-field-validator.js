import { isNullish, isNumber } from "@backend/lib/helper/typescript-helpers.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class OrderFieldValidator {
    validate(order) {
        try {
            this.validateOrderFields(order);
            for (const orderItem of order.orderItems) {
                this.validateOrderItemFields(orderItem);
            }
        }
        catch (error) {
            if (error instanceof BlError) {
                return Promise.reject(error);
            }
            return Promise.reject(new BlError("unknown error, orderItem could not be validated").store("error", error));
        }
        return Promise.resolve(true);
    }
    validateOrderFields(order) {
        if (isNullish(order.amount)) {
            throw new BlError("order.amount is undefined");
        }
        if (isNullish(order.orderItems) || order.orderItems.length <= 0) {
            throw new BlError("order.orderItems is empty or undefined");
        }
        return true;
    }
    validateOrderItemFields(orderItem) {
        if (!orderItem.item) {
            throw new BlError("orderItem.item is not defined");
        }
        if (!orderItem.title) {
            throw new BlError("orderItem.title is not defined");
        }
        if (!isNumber(orderItem.amount)) {
            throw new BlError("orderItem.amount is not defined");
        }
        if (!isNumber(orderItem.unitPrice)) {
            throw new BlError("orderItem.unitPrice is not defined");
        }
        if (!isNumber(orderItem.taxAmount)) {
            throw new BlError("orderItem.taxAmount is not defined");
        }
        if (!isNumber(orderItem.taxRate)) {
            throw new BlError("orderItem.taxRate is not defined");
        }
        if (isNullish(orderItem.type)) {
            throw new BlError("orderItem.type is not defined");
        }
        return true;
    }
}
