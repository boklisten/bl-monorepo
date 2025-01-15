import { CustomerItemModel } from "@backend/collections/customer-item/customer-item.model";
import { CustomerItemActive } from "@backend/collections/customer-item/helpers/customer-item-active";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { CustomerItem } from "@shared/customer-item/customer-item";

export class CustomerHaveActiveCustomerItems {
  private queryBuilder = new SEDbQueryBuilder();
  private customerItemActive = new CustomerItemActive();
  private customerItemStorage: BlStorage<CustomerItem>;

  constructor(customerItemStorage?: BlStorage<CustomerItem>) {
    this.customerItemStorage =
      customerItemStorage ?? new BlStorage(CustomerItemModel);
  }

  public async haveActiveCustomerItems(userId: string): Promise<boolean> {
    const databaseQuery = this.queryBuilder.getDbQuery({ customer: userId }, [
      { fieldName: "customer", type: "object-id" },
    ]);
    let customerItems: CustomerItem[];

    try {
      customerItems = await this.customerItemStorage.getByQuery(databaseQuery);
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
