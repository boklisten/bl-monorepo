import "mocha";

import { CustomerInvoiceActive } from "@backend/collections/invoice/helpers/customer-invoice-active";
import { InvoiceModel } from "@backend/collections/invoice/invoice.model";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Invoice } from "@shared/invoice/invoice";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("CustomerInvoiceActive", () => {
  const invoiceStorage = new BlDocumentStorage(InvoiceModel);
  const getInvoicesByQueryStub = sinon.stub(invoiceStorage, "getByQuery");
  const customerInvoiceActive = new CustomerInvoiceActive(invoiceStorage);
  const testUserId = "5f2aa6e8d39045001c444842";

  describe("haveActiveInvoices()", () => {
    it("should return false if no invoices was found for customer", () => {
      getInvoicesByQueryStub.rejects(new BlError("not found").code(702));

      return expect(customerInvoiceActive.haveActiveInvoices(testUserId)).to
        .eventually.be.false;
    });

    it("should return false if invoices was found but none was active", () => {
      const inactiveInvoice: Invoice = {
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
      };

      const inactiveInvoice2: Invoice = {
        id: "invoice2",
        duedate: new Date(),
        customerHavePayed: false,
        toDebtCollection: false,
        toCreditNote: true,
        customerItemPayments: [],

        // @ts-expect-error fixme: auto ignored
        customerInfo: null,

        // @ts-expect-error fixme: auto ignored
        payment: null,
      };

      getInvoicesByQueryStub.resolves([inactiveInvoice, inactiveInvoice2]);

      return expect(customerInvoiceActive.haveActiveInvoices(testUserId)).to
        .eventually.be.false;
    });

    it("should return true if invoices was found and at least one was active", () => {
      const inactiveInvoice: Invoice = {
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
      };

      const inactiveInvoice2: Invoice = {
        id: "invoice2",
        duedate: new Date(),
        customerHavePayed: false,
        toDebtCollection: false,
        toCreditNote: false,
        customerItemPayments: [],

        // @ts-expect-error fixme: auto ignored
        customerInfo: null,

        // @ts-expect-error fixme: auto ignored
        payment: null,
      };

      getInvoicesByQueryStub.resolves([inactiveInvoice, inactiveInvoice2]);

      return expect(customerInvoiceActive.haveActiveInvoices(testUserId)).to
        .eventually.be.true;
    });
  });
});
