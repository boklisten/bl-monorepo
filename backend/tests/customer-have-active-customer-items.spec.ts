import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { CustomerHaveActiveCustomerItems } from "#services/collections/customer-item/helpers/customer-have-active-customer-items";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { CustomerItem } from "#shared/customer-item/customer-item";

chaiUse(chaiAsPromised);
should();

test.group("CustomerHaveActiveCustomerItems", (group) => {
  const customerHaveActiveCustomerItems = new CustomerHaveActiveCustomerItems();

  const testUserId = "5d765db5fc8c47001c408d8d";

  let sandbox: sinon.SinonSandbox;
  let customerItemByQueryStub: sinon.SinonStub;
  group.each.setup(() => {
    sandbox = createSandbox();
    customerItemByQueryStub = sandbox.stub(
      BlStorage.CustomerItems,
      "getByQuery",
    );
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should resolve with false if no customerItems is found", async () => {
    customerItemByQueryStub.rejects(new BlError("not found").code(702));

    return expect(
      customerHaveActiveCustomerItems.haveActiveCustomerItems(testUserId),
    ).to.eventually.be.false;
  });

  test("should resolve with false if no customerItems was active", async () => {
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

  test("should resolve with true if at least one customerItem was active", async () => {
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
