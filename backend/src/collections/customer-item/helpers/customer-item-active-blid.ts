import { CustomerItemModel } from "@backend/collections/customer-item/customer-item.model";
import { CustomerItemActive } from "@backend/collections/customer-item/helpers/customer-item-active";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlStorage } from "@backend/storage/blStorage";
import { CustomerItem } from "@shared/customer-item/customer-item";

export class CustomerItemActiveBlid {
  private customerItemStorage: BlStorage<CustomerItem>;
  private customerItemActive = new CustomerItemActive();
  private dbQueryBuilder = new SEDbQueryBuilder();

  constructor(customerItemStorage?: BlStorage<CustomerItem>) {
    this.customerItemStorage =
      customerItemStorage ?? new BlStorage(CustomerItemModel);
  }

  /**
   * Checks if a blid is used by an active customerItem
   */
  async getActiveCustomerItemIds(blid: string): Promise<string[]> {
    const activeCustomerItems = await this.getActiveCustomerItems(blid);
    return activeCustomerItems.map((customerItem) => customerItem.id);
  }

  async getActiveCustomerItems(blid: string): Promise<CustomerItem[]> {
    const databaseQuery = this.dbQueryBuilder.getDbQuery({ blid: blid }, [
      { fieldName: "blid", type: "string" },
    ]);

    const customerItems =
      await this.customerItemStorage.getByQuery(databaseQuery);

    const activeCustomerItems = customerItems.filter((customerItem) =>
      this.customerItemActive.isActive(customerItem),
    );

    if (!activeCustomerItems || activeCustomerItems.length <= 0) {
      return [];
    }

    return activeCustomerItems;
  }
}
