import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class CustomerItemValidator {
    validate(customerItem) {
        if (isNullish(customerItem)) {
            return Promise.reject(new BlError("customerItem is undefined"));
        }
        return Promise.resolve(true);
    }
}
