import { Invoice } from "@boklisten/bl-model";

export class InvoiceActive {
  public isActive(invoice: Invoice): boolean {
    if (invoice.customerHavePayed || invoice.toCreditNote) {
      return false;
    }

    return true;
  }
}
