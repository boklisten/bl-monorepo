import { InvoiceActive } from "@backend/collections/invoice/helpers/invoice-active";
import { InvoiceModel } from "@backend/collections/invoice/invoice.model";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Invoice } from "@shared/invoice/invoice";

export class CustomerInvoiceActive {
  private queryBuilder: SEDbQueryBuilder;
  private invoiceActive: InvoiceActive;
  private invoiceStorage: BlStorage<Invoice>;

  constructor(invoiceStorage?: BlStorage<Invoice>) {
    this.invoiceStorage = invoiceStorage ?? new BlStorage(InvoiceModel);
    this.queryBuilder = new SEDbQueryBuilder();
    this.invoiceActive = new InvoiceActive();
  }

  public async haveActiveInvoices(userId: string): Promise<boolean> {
    const databaseQuery = this.queryBuilder.getDbQuery(
      { "customerInfo.userDetail": userId },
      [{ fieldName: "customerInfo.userDetail", type: "object-id" }],
    );
    let invoices: Invoice[];
    try {
      invoices = await this.invoiceStorage.getByQuery(databaseQuery);
    } catch (error) {
      if (error instanceof BlError && error.getCode() == 702) {
        return false;
      }
    }

    // @ts-expect-error fixme: auto ignored
    return invoices.some((invoice) => this.invoiceActive.isActive(invoice));
  }
}
