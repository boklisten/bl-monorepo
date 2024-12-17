import { isNullish } from "@backend/helper/typescript-helpers";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { CustomerItem } from "@shared/customer-item/customer-item";

export class CustomerItemValidator {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line
  constructor(customerItemStorage?: BlDocumentStorage<CustomerItem>) {}

  public validate(customerItem: CustomerItem): Promise<boolean> {
    if (isNullish(customerItem)) {
      return Promise.reject(new BlError("customerItem is undefined"));
    }

    return Promise.resolve(true);
  }
}
