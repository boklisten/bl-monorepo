import { BlError, CustomerItem } from "@boklisten/bl-model";

import { isNullish } from "@/helper/typescript-helpers";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

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
