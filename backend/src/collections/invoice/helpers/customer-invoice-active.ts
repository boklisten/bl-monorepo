import { InvoiceActive } from "@backend/collections/invoice/helpers/invoice-active";
import { InvoiceModel } from "@backend/collections/invoice/invoice.model";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Invoice } from "@shared/invoice/invoice";

export class CustomerInvoiceActive {
  private queryBuilder: SEDbQueryBuilder;
  private invoiceActive: InvoiceActive;
  private invoiceStorage: BlDocumentStorage<Invoice>;

  constructor(invoiceStorage?: BlDocumentStorage<Invoice>) {
    this.invoiceStorage = invoiceStorage ?? new BlDocumentStorage(InvoiceModel);
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
