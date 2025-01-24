import { BlError } from "@shared/bl-error/bl-error.js";
export class DeliveryBranchHandler {
    validate(delivery) {
        if (delivery.amount > 0) {
            return Promise.reject(new BlError(`delivery.amount is "${delivery.amount}" but should be "0"`));
        }
        return Promise.resolve(true);
    }
}
