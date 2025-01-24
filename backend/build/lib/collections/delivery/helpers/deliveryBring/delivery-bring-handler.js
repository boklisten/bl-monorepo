import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class DeliveryBringHandler {
    validate(delivery) {
        if (isNullish(delivery.info)) {
            return Promise.reject(new BlError("delivery.info not defined"));
        }
        // @ts-expect-error fixme bad types
        if (isNullish(delivery.info["from"])) {
            return Promise.reject(new BlError("delivery.info.from not defined"));
        }
        // @ts-expect-error fixme bad types
        if (isNullish(delivery.info["to"])) {
            return Promise.reject(new BlError("delivery.info.to not defined"));
        }
        return Promise.resolve(true);
    }
}
