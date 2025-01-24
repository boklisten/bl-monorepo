import { InvoiceActive } from "@backend/lib/collections/invoice/helpers/invoice-active.js";
import { test } from "@japa/runner";
import { Invoice } from "@shared/invoice/invoice.js";
import { expect } from "chai";

test.group("InvoiceActive", async () => {
  const invoiceActive = new InvoiceActive();

  test("should return false if invoice is not active", async () => {
    const nonActiveInvoices: Invoice[] = [
      {
        id: "invoice1",
        duedate: new Date(),
        customerHavePayed: true,
        toDebtCollection: false,
        toCreditNote: false,
        customerItemPayments: [],

        // @ts-expect-error fixme: auto ignored
        customerInfo: null,

        // @ts-expect-error fixme: auto ignored
        payment: null,
      },
      {
        id: "invoice1",
        duedate: new Date(),
        customerHavePayed: false,
        toDebtCollection: false,
        toCreditNote: true,
        customerItemPayments: [],

        // @ts-expect-error fixme: auto ignored
        customerInfo: null,

        // @ts-expect-error fixme: auto ignored
        payment: null,
      },
    ];

    for (const invoice of nonActiveInvoices) {
      expect(invoiceActive.isActive(invoice)).to.be.false;
    }
  });

  test("should return true if invoice is active", async () => {
    const activeInvoices: Invoice[] = [
      {
        id: "invoice1",
        duedate: new Date(),
        customerHavePayed: false,
        toDebtCollection: false,
        toCreditNote: false,
        customerItemPayments: [],

        // @ts-expect-error fixme: auto ignored
        customerInfo: null,

        // @ts-expect-error fixme: auto ignored
        payment: null,
      },
      {
        id: "invoice1",
        duedate: new Date(),
        customerHavePayed: false,
        toDebtCollection: true,
        toCreditNote: false,
        customerItemPayments: [],

        // @ts-expect-error fixme: auto ignored
        customerInfo: null,

        // @ts-expect-error fixme: auto ignored
        payment: null,
      },
    ];

    for (const invoice of activeInvoices) {
      expect(invoiceActive.isActive(invoice)).to.be.true;
    }
  });
});
