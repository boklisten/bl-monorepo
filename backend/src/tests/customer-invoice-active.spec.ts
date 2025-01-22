import { CustomerInvoiceActive } from "@backend/collections/invoice/helpers/customer-invoice-active.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Invoice } from "@shared/invoice/invoice.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("CustomerInvoiceActive", (group) => {
  const customerInvoiceActive = new CustomerInvoiceActive();
  const testUserId = "5f2aa6e8d39045001c444842";
  let sandbox: sinon.SinonSandbox;
  let getInvoicesByQueryStub: sinon.SinonStub;

  group.each.setup(() => {
    sandbox = createSandbox();
    getInvoicesByQueryStub = sandbox.stub(BlStorage.Invoices, "getByQuery");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should return false if no invoices was found for customer", async () => {
    getInvoicesByQueryStub.rejects(new BlError("not found").code(702));

    return expect(customerInvoiceActive.haveActiveInvoices(testUserId)).to
      .eventually.be.false;
  });

  test("should return false if invoices was found but none was active", async () => {
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

  test("should return true if invoices was found and at least one was active", async () => {
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
