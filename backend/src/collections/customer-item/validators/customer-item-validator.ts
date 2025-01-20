import { isNullish } from "@backend/helper/typescript-helpers.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { CustomerItem } from "@shared/customer-item/customer-item.js";

export class CustomerItemValidator {
  public validate(customerItem: CustomerItem): Promise<boolean> {
    if (isNullish(customerItem)) {
      return Promise.reject(new BlError("customerItem is undefined"));
    }

    return Promise.resolve(true);
  }
}
