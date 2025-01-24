import { CustomerItemActive } from "@backend/lib/collections/customer-item/helpers/customer-item-active.js";
import { SEDbQueryBuilder } from "@backend/lib/query/se.db-query-builder.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export class CustomerItemActiveBlid {
    customerItemActive = new CustomerItemActive();
    dbQueryBuilder = new SEDbQueryBuilder();
    /**
     * Checks if a blid is used by an active customerItem
     */
    async getActiveCustomerItemIds(blid) {
        const activeCustomerItems = await this.getActiveCustomerItems(blid);
        return activeCustomerItems.map((customerItem) => customerItem.id);
    }
    async getActiveCustomerItems(blid) {
        const databaseQuery = this.dbQueryBuilder.getDbQuery({ blid: blid }, [
            { fieldName: "blid", type: "string" },
        ]);
        const customerItems = await BlStorage.CustomerItems.getByQuery(databaseQuery);
        const activeCustomerItems = customerItems.filter((customerItem) => this.customerItemActive.isActive(customerItem));
        if (!activeCustomerItems || activeCustomerItems.length <= 0) {
            return [];
        }
        return activeCustomerItems;
    }
}
