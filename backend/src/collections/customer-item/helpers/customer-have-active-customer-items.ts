import { BlError, CustomerItem } from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { customerItemSchema } from "@/collections/customer-item/customer-item.schema";
import { CustomerItemActive } from "@/collections/customer-item/helpers/customer-item-active";
import { SEDbQueryBuilder } from "@/query/se.db-query-builder";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class CustomerHaveActiveCustomerItems {
  private queryBuilder: SEDbQueryBuilder;
  private customerItemActive: CustomerItemActive;

  constructor(private _customerItemStorage?: BlDocumentStorage<CustomerItem>) {
    this._customerItemStorage =
      this._customerItemStorage ??
      new BlDocumentStorage(BlCollectionName.CustomerItems, customerItemSchema);
    this.queryBuilder = new SEDbQueryBuilder();
    this.customerItemActive = new CustomerItemActive();
  }

  public async haveActiveCustomerItems(userId: string): Promise<boolean> {
    const dbQuery = this.queryBuilder.getDbQuery({ customer: userId }, [
      { fieldName: "customer", type: "object-id" },
    ]);
    let customerItems: CustomerItem[];

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      customerItems = await this._customerItemStorage.getByQuery(dbQuery);
    } catch (e) {
      if (e instanceof BlError) {
        if (e.getCode() == 702) {
          return false;
        }
      }
      throw e;
    }

    return customerItems.some((customerItem) =>
      this.customerItemActive.isActive(customerItem),
    );
  }
}
