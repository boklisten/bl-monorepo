import "mocha";

import { CustomerItemModel } from "@backend/collections/customer-item/customer-item.model";
import { CustomerItemActiveBlid } from "@backend/collections/customer-item/helpers/customer-item-active-blid";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("CustomerItemActiveBlid", () => {
  const customerItemStorage = new BlDocumentStorage(CustomerItemModel);

  const getByQueryCustomerItemStub = sinon.stub(
    customerItemStorage,
    "getByQuery",
  );

  const customerItemActiveBlid = new CustomerItemActiveBlid(
    customerItemStorage,
  );

  beforeEach(() => {
    getByQueryCustomerItemStub.reset();
  });

  describe("isActive()", () => {
    it("should resolve true if one customerItem is active", () => {
      const customerItem1 = {
        id: "customerItem1",
        item: "item1",
        blid: "blid1",
        customer: "customer1",
        deadline: new Date(),
        handout: true,
        returned: false,
      };

      const customerItem2 = {
        id: "customerItem2",
        item: "item2",
        blid: "blid1",
        customer: "customer2",
        deadline: new Date(),
        handout: true,
        returned: true,
      };

      getByQueryCustomerItemStub.resolves([customerItem1, customerItem2]);

      return expect(
        customerItemActiveBlid.getActiveCustomerItemIds("blid1"),
      ).eventually.be.eql(["customerItem1"]);
    });

    it("should resolve false if no customerItem is active", () => {
      const customerItem = {
        id: "customerItem1",
        item: "item1",
        blid: "blid1",
        customer: "customer1",
        deadline: new Date(),
        handout: true,
        returned: true,
      };

      getByQueryCustomerItemStub.resolves([customerItem]);

      return expect(
        customerItemActiveBlid.getActiveCustomerItemIds("blid1"),
      ).eventually.be.eql([]);
    });
  });
});
