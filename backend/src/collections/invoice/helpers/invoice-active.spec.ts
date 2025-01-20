import "mocha";
import { InvoiceActive } from "@backend/collections/invoice/helpers/invoice-active.js";
import { Invoice } from "@shared/invoice/invoice.js";
import { expect, should } from "chai";

describe("InvoiceActive", () => {
  const invoiceActive = new InvoiceActive();

  describe("isActive()", () => {
    it("should return false if invoice is not active", () => {
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

    it("should return true if invoice is active", () => {
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
});
