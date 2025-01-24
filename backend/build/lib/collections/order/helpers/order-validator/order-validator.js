import { OrderFieldValidator } from "@backend/lib/collections/order/helpers/order-validator/order-field-validator/order-field-validator.js";
import { OrderItemValidator } from "@backend/lib/collections/order/helpers/order-validator/order-item-validator/order-item-validator.js";
import { OrderPlacedValidator } from "@backend/lib/collections/order/helpers/order-validator/order-placed-validator/order-placed-validator.js";
import { OrderUserDetailValidator } from "@backend/lib/collections/order/helpers/order-validator/order-user-detail-validator/order-user-detail-validator.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class OrderValidator {
    orderPlacedValidator;
    orderItemValidator;
    orderFieldValidator;
    orderUserDetailValidator;
    constructor(orderItemValidator, orderPlacedValidator, orderFieldValidator, orderUserDetailValidator) {
        this.orderItemValidator = orderItemValidator ?? new OrderItemValidator();
        this.orderPlacedValidator =
            orderPlacedValidator ?? new OrderPlacedValidator();
        this.orderFieldValidator = orderFieldValidator ?? new OrderFieldValidator();
        this.orderUserDetailValidator =
            orderUserDetailValidator ?? new OrderUserDetailValidator();
    }
    async validate(order, isAdmin) {
        try {
            if (this.mustHaveCustomer(order)) {
                await this.orderUserDetailValidator.validate(order);
            }
            await this.orderFieldValidator.validate(order);
            const branch = await BlStorage.Branches.get(order.branch);
            await this.orderItemValidator.validate(branch, order, isAdmin);
            await this.orderPlacedValidator.validate(order);
        }
        catch (error) {
            if (error instanceof BlError) {
                return Promise.reject(error);
            }
            return Promise.reject(new BlError("order could not be validated").store("error", error));
        }
        return true;
    }
    mustHaveCustomer(order) {
        for (const orderItem of order.orderItems) {
            if (orderItem.type !== "buy") {
                return true;
            }
        }
        return false;
    }
}
