import { PermissionService } from "@backend/lib/auth/permission.service.js";
import { OrderValidator } from "@backend/lib/collections/order/helpers/order-validator/order-validator.js";
import { OrderHookBefore } from "@backend/lib/collections/order/hooks/order-hook-before.js";
import { UserDetailHelper } from "@backend/lib/collections/user-detail/helpers/user-detail.helper.js";
import { Hook } from "@backend/lib/hook/hook.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class OrderPostHook extends Hook {
    orderValidator;
    orderHookBefore;
    userDetailHelper;
    constructor(orderValidator, orderHookBefore, userDetailHelper) {
        super();
        this.orderValidator = orderValidator ?? new OrderValidator();
        this.orderHookBefore = orderHookBefore ?? new OrderHookBefore();
        this.userDetailHelper = userDetailHelper ?? new UserDetailHelper();
    }
    async before(requestBody, accessToken) {
        const [validUserDetails, validRequestBody] = await Promise.all([
            BlStorage.UserDetails.get(accessToken.details).then((userDetail) => this.userDetailHelper.isValid(userDetail)),
            this.orderHookBefore.validate(requestBody),
        ]);
        if (!validUserDetails) {
            throw new BlError("UserDetail not set for user: " + accessToken.username).code(902);
        }
        if (!validRequestBody) {
            throw new BlError("Invalid order").code(701);
        }
        return true;
    }
    after(orders, accessToken) {
        if (!accessToken || accessToken.sub.length <= 0) {
            return Promise.reject(new BlError("accessToken was not specified when trying to process order"));
        }
        if (!orders || orders.length <= 0) {
            return Promise.reject(new BlError("no orders provided").code(701));
        }
        if (orders.length > 1) {
            return Promise.reject(new BlError("orderIds included more than one id"));
        }
        const order = orders[0];
        const isAdmin = PermissionService.isPermissionEqualOrOver(accessToken.permission, "admin");
        // @ts-expect-error fixme: auto ignored
        return this.validateOrder(order, isAdmin).then(() => {
            return [order];
        });
    }
    validateOrder(order, isAdmin) {
        return new Promise((resolve, reject) => {
            this.orderValidator
                .validate(order, isAdmin)
                .then(() => {
                if (order.placed) {
                    return reject(new BlError("order.placed is set to true on post of order"));
                }
                resolve(order);
            })
                .catch((blError) => {
                return reject(blError);
            });
        });
    }
}
