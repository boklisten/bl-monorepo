import { DeliveryBranchHandler } from "@backend/lib/collections/delivery/helpers/deliveryBranch/delivery-branch-handler.js";
import { DeliveryBringHandler } from "@backend/lib/collections/delivery/helpers/deliveryBring/delivery-bring-handler.js";
import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class DeliveryValidator {
    deliveryBranchHandler;
    deliveryBringHandler;
    constructor(deliveryBranchHandler, deliveryBringHandler) {
        this.deliveryBranchHandler = deliveryBranchHandler
            ? deliveryBranchHandler
            : new DeliveryBranchHandler();
        this.deliveryBringHandler = deliveryBringHandler
            ? deliveryBringHandler
            : new DeliveryBringHandler();
    }
    validate(delivery) {
        if (isNullish(delivery.method)) {
            return Promise.reject(new BlError("delivery.method not defined"));
        }
        return this.validateBasedOnMethod(delivery);
    }
    validateBasedOnMethod(delivery) {
        switch (delivery.method) {
            case "branch": {
                return this.deliveryBranchHandler.validate(delivery);
            }
            case "bring": {
                return this.deliveryBringHandler.validate(delivery);
            }
            default: {
                return Promise.reject(new BlError(`delivery.method "${delivery.method}" is not supported`).store("delivery", delivery));
            }
        }
    }
}
