import "mocha";
import { BlError, Invoice } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { BlCollectionName } from "@/collections/bl-collection";
import { CustomerInvoiceActive } from "@/collections/invoice/helpers/customer-invoice-active";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";
chai.use(chaiAsPromised);

describe("CustomerInvoiceActive", () => {
  const invoiceStorage = new BlDocumentStorage<Invoice>(
    BlCollectionName.Invoices,
  );
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        customerInfo: null,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        payment: null,
      };

      const inactiveInvoice2: Invoice = {
        id: "invoice2",
        duedate: new Date(),
        customerHavePayed: false,
        toDebtCollection: false,
        toCreditNote: true,
        customerItemPayments: [],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        customerInfo: null,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        customerInfo: null,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        payment: null,
      };

      const inactiveInvoice2: Invoice = {
        id: "invoice2",
        duedate: new Date(),
        customerHavePayed: false,
        toDebtCollection: false,
        toCreditNote: false,
        customerItemPayments: [],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        customerInfo: null,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        payment: null,
      };

      getInvoicesByQueryStub.resolves([inactiveInvoice, inactiveInvoice2]);

      return expect(customerInvoiceActive.haveActiveInvoices(testUserId)).to
        .eventually.be.true;
    });
  });
});
