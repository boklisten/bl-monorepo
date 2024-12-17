import { Invoice } from "@shared/invoice/invoice";

export class InvoiceActive {
  public isActive(invoice: Invoice): boolean {
    if (invoice.customerHavePayed || invoice.toCreditNote) {
      return false;
    }

    return true;
  }
}
