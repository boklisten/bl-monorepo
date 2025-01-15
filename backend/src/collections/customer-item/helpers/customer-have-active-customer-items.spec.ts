import "mocha";

import { CustomerItemModel } from "@backend/collections/customer-item/customer-item.model";
import { CustomerHaveActiveCustomerItems } from "@backend/collections/customer-item/helpers/customer-have-active-customer-items";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("CustomerHaveActiveCustomerItems", () => {
  const customerItemStorage = new BlStorage(CustomerItemModel);

  const customerItemByQueryStub = sinon.stub(customerItemStorage, "getByQuery");

  const customerHaveActiveCustomerItems = new CustomerHaveActiveCustomerItems(
    customerItemStorage,
  );

  const testUserId = "5d765db5fc8c47001c408d8d";

  beforeEach(() => {
    customerItemByQueryStub.reset();
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
