import { CustomerItemModel } from "@backend/collections/customer-item/customer-item.model";
import { CustomerItemActive } from "@backend/collections/customer-item/helpers/customer-item-active";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { CustomerItem } from "@shared/customer-item/customer-item";

export class CustomerHaveActiveCustomerItems {
  private queryBuilder: SEDbQueryBuilder;
  private customerItemActive: CustomerItemActive;

  constructor(private _customerItemStorage?: BlDocumentStorage<CustomerItem>) {
    this._customerItemStorage =
      this._customerItemStorage ?? new BlDocumentStorage(CustomerItemModel);
    this.queryBuilder = new SEDbQueryBuilder();
    this.customerItemActive = new CustomerItemActive();
  }

  public async haveActiveCustomerItems(userId: string): Promise<boolean> {
    const databaseQuery = this.queryBuilder.getDbQuery({ customer: userId }, [
      { fieldName: "customer", type: "object-id" },
    ]);
    let customerItems: CustomerItem[];

    try {
      // @ts-expect-error fixme: auto ignored
      customerItems = await this._customerItemStorage.getByQuery(databaseQuery);
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
