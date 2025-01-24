import { CustomerHaveActiveCustomerItems } from "@backend/lib/collections/customer-item/helpers/customer-have-active-customer-items.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();
test.group("CustomerHaveActiveCustomerItems", (group) => {
    const customerHaveActiveCustomerItems = new CustomerHaveActiveCustomerItems();
    const testUserId = "5d765db5fc8c47001c408d8d";
    let sandbox;
    let customerItemByQueryStub;
    group.each.setup(() => {
        sandbox = createSandbox();
        customerItemByQueryStub = sandbox.stub(BlStorage.CustomerItems, "getByQuery");
    });
    group.each.teardown(() => {
        sandbox.restore();
    });
    test("should resolve with false if no customerItems is found", async () => {
        customerItemByQueryStub.rejects(new BlError("not found").code(702));
        return expect(customerHaveActiveCustomerItems.haveActiveCustomerItems(testUserId)).to.eventually.be.false;
    });
    test("should resolve with false if no customerItems was active", async () => {
        const nonActiveCustomerItem = {
            id: "customerItem1",
            item: "item1",
            deadline: new Date(),
            customer: testUserId,
            handout: true,
            returned: true,
        };
        customerItemByQueryStub.resolves([nonActiveCustomerItem]);
        return expect(customerHaveActiveCustomerItems.haveActiveCustomerItems(testUserId)).to.eventually.be.false;
    });
    test("should resolve with true if at least one customerItem was active", async () => {
        const nonActiveCustomerItem = {
            id: "customerItem1",
            item: "item1",
            deadline: new Date(),
            customer: testUserId,
            handout: true,
            returned: true,
        };
        const activeCustomerItem = {
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
        return expect(customerHaveActiveCustomerItems.haveActiveCustomerItems(testUserId)).to.eventually.be.true;
    });
});
