import { CustomerItemActiveBlid } from "@backend/lib/collections/customer-item/helpers/customer-item-active-blid.js";
import { UniqueItemActiveOperation } from "@backend/lib/collections/unique-item/operations/unique-item-active.operation.js";
import BlResponseHandler from "@backend/lib/response/bl-response.handler.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
chaiUse(chaiAsPromised);
should();
test.group("UniqueItemActiveOperation", (group) => {
    const customerItemActiveBlid = new CustomerItemActiveBlid();
    const uniqueItemActiveOperation = new UniqueItemActiveOperation(customerItemActiveBlid);
    let sandbox;
    let getUniqueItemStub;
    let getActiveCustomerItemsStub;
    group.each.setup(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(BlResponseHandler, "sendResponse").resolves(true);
        getActiveCustomerItemsStub = sandbox.stub(customerItemActiveBlid, "getActiveCustomerItems");
        getUniqueItemStub = sandbox.stub(BlStorage.UniqueItems, "get");
    });
    group.each.teardown(() => {
        sandbox.restore();
    });
    test("should not reject", async ({ assert }) => {
        getUniqueItemStub.resolves({ blid: "blid1" });
        getActiveCustomerItemsStub.resolves([]);
        assert.doesNotReject(() => uniqueItemActiveOperation.run({
            documentId: "uniqueItem1",
        }));
    });
});
