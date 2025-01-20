import { CustomerItemActive } from "@backend/collections/customer-item/helpers/customer-item-active.js";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { CustomerItem } from "@shared/customer-item/customer-item.js";

export class CustomerItemActiveBlid {
  private customerItemActive = new CustomerItemActive();
  private dbQueryBuilder = new SEDbQueryBuilder();

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
      await BlStorage.CustomerItems.getByQuery(databaseQuery);

    const activeCustomerItems = customerItems.filter((customerItem) =>
      this.customerItemActive.isActive(customerItem),
    );

    if (!activeCustomerItems || activeCustomerItems.length <= 0) {
      return [];
    }

    return activeCustomerItems;
  }
}
