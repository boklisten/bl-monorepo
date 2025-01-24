export class InvoiceActive {
    isActive(invoice) {
        if (invoice.customerHavePayed || invoice.toCreditNote) {
            return false;
        }
        return true;
    }
}
