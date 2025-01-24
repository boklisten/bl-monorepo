import { InvoiceActive } from "@backend/lib/collections/invoice/helpers/invoice-active.js";
import { SEDbQueryBuilder } from "@backend/lib/query/se.db-query-builder.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Invoice } from "@shared/invoice/invoice.js";

export class CustomerInvoiceActive {
  private queryBuilder = new SEDbQueryBuilder();
  private invoiceActive = new InvoiceActive();

  public async haveActiveInvoices(userId: string): Promise<boolean> {
    const databaseQuery = this.queryBuilder.getDbQuery(
      { "customerInfo.userDetail": userId },
      [{ fieldName: "customerInfo.userDetail", type: "object-id" }],
    );
    let invoices: Invoice[];
    try {
      invoices = await BlStorage.Invoices.getByQuery(databaseQuery);
    } catch (error) {
      if (error instanceof BlError && error.getCode() == 702) {
        return false;
      }
    }

    // @ts-expect-error fixme: auto ignored
    return invoices.some((invoice) => this.invoiceActive.isActive(invoice));
  }
}
