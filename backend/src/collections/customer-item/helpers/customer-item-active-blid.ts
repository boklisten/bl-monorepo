import { BlCollectionName } from "@backend/collections/bl-collection";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { CustomerItemActive } from "@backend/collections/customer-item/helpers/customer-item-active";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { CustomerItem } from "@shared/customer-item/customer-item";

export class CustomerItemActiveBlid {
  private readonly _customerItemStorage: BlDocumentStorage<CustomerItem>;
  private customerItemActive: CustomerItemActive;
  private dbQueryBuilder: SEDbQueryBuilder;

  constructor(customerItemStorage?: BlDocumentStorage<CustomerItem>) {
    this._customerItemStorage =
      customerItemStorage ??
      new BlDocumentStorage<CustomerItem>(
        BlCollectionName.CustomerItems,
        customerItemSchema,
      );
    this.customerItemActive = new CustomerItemActive();
    this.dbQueryBuilder = new SEDbQueryBuilder();
  }

  /**
   * Checks if a blid is used by an active customerItem
   */
  async getActiveCustomerItemIds(blid: string): Promise<string[]> {
    const activeCustomerItems = await this.getActiveCustomerItems(blid);
    return activeCustomerItems.map((customerItem) => customerItem.id);
  }

  async getActiveCustomerItems(blid: string): Promise<CustomerItem[]> {
    const dbQuery = this.dbQueryBuilder.getDbQuery({ blid: blid }, [
      { fieldName: "blid", type: "string" },
    ]);

    const customerItems = await this._customerItemStorage.getByQuery(dbQuery);

    const activeCustomerItems = customerItems.filter((customerItem) =>
      this.customerItemActive.isActive(customerItem),
    );

    if (!activeCustomerItems || activeCustomerItems.length <= 0) {
      return [];
    }

    return activeCustomerItems;
  }
}
