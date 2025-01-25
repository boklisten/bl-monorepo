import { BlError } from "@shared/bl-error/bl-error.js";
import { Invoice } from "@shared/invoice/invoice.js";

import { InvoiceActive } from "#services/collections/invoice/helpers/invoice-active";
import { SEDbQueryBuilder } from "#services/query/se.db-query-builder";
import { BlStorage } from "#services/storage/bl-storage";

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
