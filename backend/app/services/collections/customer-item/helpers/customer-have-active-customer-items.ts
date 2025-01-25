import { BlError } from "@shared/bl-error/bl-error.js";
import { CustomerItem } from "@shared/customer-item/customer-item.js";

import { CustomerItemActive } from "#services/collections/customer-item/helpers/customer-item-active";
import { SEDbQueryBuilder } from "#services/query/se.db-query-builder";
import { BlStorage } from "#services/storage/bl-storage";

export class CustomerHaveActiveCustomerItems {
  private queryBuilder = new SEDbQueryBuilder();
  private customerItemActive = new CustomerItemActive();

  public async haveActiveCustomerItems(userId: string): Promise<boolean> {
    const databaseQuery = this.queryBuilder.getDbQuery({ customer: userId }, [
      { fieldName: "customer", type: "object-id" },
    ]);
    let customerItems: CustomerItem[];

    try {
      customerItems = await BlStorage.CustomerItems.getByQuery(databaseQuery);
    } catch (error) {
      if (error instanceof BlError && error.getCode() == 702) {
        return false;
      }
      throw error;
    }

    return customerItems.some((customerItem) =>
      this.customerItemActive.isActive(customerItem),
    );
  }
}
