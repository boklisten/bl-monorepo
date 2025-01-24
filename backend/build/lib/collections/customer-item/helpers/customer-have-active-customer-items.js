import { CustomerItemActive } from "@backend/lib/collections/customer-item/helpers/customer-item-active.js";
import { SEDbQueryBuilder } from "@backend/lib/query/se.db-query-builder.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class CustomerHaveActiveCustomerItems {
    queryBuilder = new SEDbQueryBuilder();
    customerItemActive = new CustomerItemActive();
    async haveActiveCustomerItems(userId) {
        const databaseQuery = this.queryBuilder.getDbQuery({ customer: userId }, [
            { fieldName: "customer", type: "object-id" },
        ]);
        let customerItems;
        try {
            customerItems = await BlStorage.CustomerItems.getByQuery(databaseQuery);
        }
        catch (error) {
            if (error instanceof BlError && error.getCode() == 702) {
                return false;
            }
            throw error;
        }
        return customerItems.some((customerItem) => this.customerItemActive.isActive(customerItem));
    }
}
