import { PermissionService } from "@backend/lib/auth/permission.service.js";
import { OrderPlacedHandler } from "@backend/lib/collections/order/helpers/order-placed-handler/order-placed-handler.js";
import { OrderValidator } from "@backend/lib/collections/order/helpers/order-validator/order-validator.js";
import { Hook } from "@backend/lib/hook/hook.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class OrderPatchHook extends Hook {
    orderValidator;
    orderPlacedHandler;
    constructor(orderValidator, orderPlacedHandler) {
        super();
        this.orderValidator = orderValidator ?? new OrderValidator();
        this.orderPlacedHandler = orderPlacedHandler ?? new OrderPlacedHandler();
    }
    before(body, accessToken, id) {
        if (!body) {
            return Promise.reject(new BlError("body not defined"));
        }
        if (!accessToken) {
            return Promise.reject(new BlError("accessToken not defined"));
        }
        if (!id) {
            return Promise.reject(new BlError("id not defined"));
        }
        return Promise.resolve(true);
    }
    after(orders, accessToken) {
        if (orders.length > 1) {
            return Promise.reject(new BlError("can only patch one order at a time"));
        }
        if (!accessToken) {
            return Promise.reject(new BlError("accessToken not defined"));
        }
        const isAdmin = PermissionService.isPermissionEqualOrOver(accessToken.permission, "admin");
        const order = orders[0];
        return new Promise((resolve, reject) => {
            if (order?.placed) {
                this.orderPlacedHandler
                    .placeOrder(order, accessToken)
                    .then((placedOrder) => {
                    resolve([placedOrder]);
                })
                    .catch((orderPlacedError) => {
                    reject(new BlError("order could not be placed").add(orderPlacedError));
                });
            }
            else {
                this.orderValidator
                    // @ts-expect-error fixme: auto ignored
                    .validate(order, isAdmin)
                    .then(() => {
                    // @ts-expect-error fixme: auto ignored
                    resolve([order]);
                })
                    .catch((validationError) => {
                    if (order?.placed) {
                        BlStorage.Orders.update(order.id, { placed: false })
                            .then(() => {
                            return reject(new BlError("validation of patch of order failed, order.placed is set to false").add(validationError));
                        })
                            .catch((updateError) => {
                            return reject(new BlError("could not set order.placed to false when order validation failed")
                                .add(updateError)
                                .add(validationError));
                        });
                    }
                    else {
                        return reject(new BlError("patch of order could not be validated").add(validationError));
                    }
                });
            }
        });
    }
}
