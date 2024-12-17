import { Invoice, BlError } from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { InvoiceActive } from "@/collections/invoice/helpers/invoice-active";
import { invoiceSchema } from "@/collections/invoice/invoice.schema";
import { SEDbQueryBuilder } from "@/query/se.db-query-builder";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class CustomerInvoiceActive {
  private queryBuilder: SEDbQueryBuilder;
  private invoiceActive: InvoiceActive;

  constructor(private invoiceStorage?: BlDocumentStorage<Invoice>) {
    this.invoiceStorage =
      this.invoiceStorage ??
      new BlDocumentStorage(BlCollectionName.Invoices, invoiceSchema);
    this.queryBuilder = new SEDbQueryBuilder();
    this.invoiceActive = new InvoiceActive();
  }

  public async haveActiveInvoices(userId: string): Promise<boolean> {
    const dbQuery = this.queryBuilder.getDbQuery(
      { "customerInfo.userDetail": userId },
      [{ fieldName: "customerInfo.userDetail", type: "object-id" }],
    );
    let invoices: Invoice[];
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      invoices = await this.invoiceStorage.getByQuery(dbQuery);
    } catch (e) {
      if (e instanceof BlError && e.getCode() == 702) {
        return false;
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return invoices.some((invoice) => this.invoiceActive.isActive(invoice));
  }
}
