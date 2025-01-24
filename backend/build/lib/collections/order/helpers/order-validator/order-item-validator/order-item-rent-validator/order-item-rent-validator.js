import { OrderItemRentPeriodValidator } from "@backend/lib/collections/order/helpers/order-validator/order-item-validator/order-item-rent-validator/order-item-rent-period-validator/order-item-rent-period-validator.js";
import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class OrderItemRentValidator {
    orderItemRentPeriodValidator = new OrderItemRentPeriodValidator();
    async validate(branch, orderItem, item) {
        try {
            this.validateOrderItemInfoFields(orderItem);
            await this.orderItemRentPeriodValidator.validate(orderItem, 
            // @ts-expect-error fixme: auto ignored
            branch.paymentInfo, item.price);
            return true;
        }
        catch (error) {
            if (error instanceof BlError) {
                return Promise.reject(error);
            }
            return Promise.reject(new BlError("unknown error, could not validate orderItem type rent").store("error", error));
        }
    }
    validateOrderItemInfoFields(orderItem) {
        if (isNullish(orderItem.info)) {
            throw new BlError('orderItem.info is not set when orderItem.type is "rent"');
        }
        return true;
    }
}
