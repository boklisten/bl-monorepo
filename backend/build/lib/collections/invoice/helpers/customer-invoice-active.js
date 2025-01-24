import { InvoiceActive } from "@backend/lib/collections/invoice/helpers/invoice-active.js";
import { SEDbQueryBuilder } from "@backend/lib/query/se.db-query-builder.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class CustomerInvoiceActive {
    queryBuilder = new SEDbQueryBuilder();
    invoiceActive = new InvoiceActive();
    async haveActiveInvoices(userId) {
        const databaseQuery = this.queryBuilder.getDbQuery({ "customerInfo.userDetail": userId }, [{ fieldName: "customerInfo.userDetail", type: "object-id" }]);
        let invoices;
        try {
            invoices = await BlStorage.Invoices.getByQuery(databaseQuery);
        }
        catch (error) {
            if (error instanceof BlError && error.getCode() == 702) {
                return false;
            }
        }
        // @ts-expect-error fixme: auto ignored
        return invoices.some((invoice) => this.invoiceActive.isActive(invoice));
    }
}
