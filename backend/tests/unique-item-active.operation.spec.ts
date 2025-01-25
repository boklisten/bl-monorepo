import { test } from "@japa/runner";
import { UniqueItem } from "@shared/unique-item/unique-item.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { CustomerItemActiveBlid } from "#services/collections/customer-item/helpers/customer-item-active-blid";
import { UniqueItemActiveOperation } from "#services/collections/unique-item/operations/unique-item-active.operation";
import BlResponseHandler from "#services/response/bl-response.handler";
import { BlStorage } from "#services/storage/bl-storage";

chaiUse(chaiAsPromised);
should();

test.group("UniqueItemActiveOperation", (group) => {
  const customerItemActiveBlid = new CustomerItemActiveBlid();

  const uniqueItemActiveOperation = new UniqueItemActiveOperation(
    customerItemActiveBlid,
  );

  let sandbox: sinon.SinonSandbox;
  let getUniqueItemStub: sinon.SinonStub;
  let getActiveCustomerItemsStub: sinon.SinonStub;

  group.each.setup(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(BlResponseHandler, "sendResponse").resolves(true);
    getActiveCustomerItemsStub = sandbox.stub(
      customerItemActiveBlid,
      "getActiveCustomerItems",
    );

    getUniqueItemStub = sandbox.stub(BlStorage.UniqueItems, "get");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should not reject", async ({ assert }) => {
    getUniqueItemStub.resolves({ blid: "blid1" } as UniqueItem);

    getActiveCustomerItemsStub.resolves([]);

    assert.doesNotReject(() =>
      uniqueItemActiveOperation.run({
        documentId: "uniqueItem1",
      }),
    );
  });
});
