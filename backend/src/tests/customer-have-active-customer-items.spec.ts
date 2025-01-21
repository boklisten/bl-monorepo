import { CustomerHaveActiveCustomerItems } from "@backend/collections/customer-item/helpers/customer-have-active-customer-items.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { CustomerItem } from "@shared/customer-item/customer-item.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("CustomerHaveActiveCustomerItems", () => {
  const customerHaveActiveCustomerItems = new CustomerHaveActiveCustomerItems();

  const testUserId = "5d765db5fc8c47001c408d8d";

  let sandbox: sinon.SinonSandbox;
  let customerItemByQueryStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = createSandbox();
    customerItemByQueryStub = sandbox.stub(
      BlStorage.CustomerItems,
      "getByQuery",
    );
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("haveActiveCustomerItems()", () => {
    it("should resolve with false if no customerItems is found", () => {
      customerItemByQueryStub.rejects(new BlError("not found").code(702));

      return expect(
        customerHaveActiveCustomerItems.haveActiveCustomerItems(testUserId),
      ).to.eventually.be.false;
    });

    it("should resolve with false if no customerItems was active", () => {
      const nonActiveCustomerItem: CustomerItem = {
        id: "customerItem1",
        item: "item1",
        deadline: new Date(),
        customer: testUserId,
        handout: true,
        returned: true,
      };

      customerItemByQueryStub.resolves([nonActiveCustomerItem]);

      return expect(
        customerHaveActiveCustomerItems.haveActiveCustomerItems(testUserId),
      ).to.eventually.be.false;
    });

    it("should resolve with true if at least one customerItem was active", () => {
      const nonActiveCustomerItem: CustomerItem = {
        id: "customerItem1",
        item: "item1",
        deadline: new Date(),
        customer: testUserId,
        handout: true,
        returned: true,
      };

      const activeCustomerItem: CustomerItem = {
        id: "customerItem1",
        item: "item1",
        deadline: new Date(),
        customer: testUserId,
        handout: true,
        returned: false,
      };

      customerItemByQueryStub.resolves([
        nonActiveCustomerItem,
        activeCustomerItem,
      ]);

      return expect(
        customerHaveActiveCustomerItems.haveActiveCustomerItems(testUserId),
      ).to.eventually.be.true;
    });
  });
});
