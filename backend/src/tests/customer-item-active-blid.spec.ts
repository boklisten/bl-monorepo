import { CustomerItemActiveBlid } from "@backend/collections/customer-item/helpers/customer-item-active-blid.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("CustomerItemActiveBlid", () => {
  let sandbox: sinon.SinonSandbox;
  let customerItemActiveBlid: CustomerItemActiveBlid;

  beforeEach(() => {
    sandbox = createSandbox();
    const customerItemsStub = {
      getByQuery: sandbox.stub(),
    };
    sandbox.stub(BlStorage, "CustomerItems").value(customerItemsStub);
    customerItemActiveBlid = new CustomerItemActiveBlid();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("isActive()", () => {
    it("should resolve true if one customerItem is active", async () => {
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

      // Grab our stub and define the return value for THIS test
      const getByQueryStub = BlStorage.CustomerItems
        .getByQuery as sinon.SinonStub;
      getByQueryStub.resolves([customerItem1, customerItem2]);

      const result =
        await customerItemActiveBlid.getActiveCustomerItemIds("blid1");
      expect(result).to.eql(["customerItem1"]);
    });

    it("should resolve false if no customerItem is active", async () => {
      const customerItem = {
        id: "customerItem1",
        item: "item1",
        blid: "blid1",
        customer: "customer1",
        deadline: new Date(),
        handout: true,
        returned: true,
      };

      // For this test, the same stub returns a different result
      const getByQueryStub = BlStorage.CustomerItems
        .getByQuery as sinon.SinonStub;
      getByQueryStub.resolves([customerItem]);

      const result =
        await customerItemActiveBlid.getActiveCustomerItemIds("blid1");
      expect(result).to.eql([]);
    });
  });
});
