import { CustomerItemActiveBlid } from "@backend/collections/customer-item/helpers/customer-item-active-blid.js";
import { UniqueItemActiveOperation } from "@backend/collections/unique-item/operations/unique-item-active.operation.js";
import BlResponseHandler from "@backend/response/bl-response.handler.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { test } from "@japa/runner";
import { UniqueItem } from "@shared/unique-item/unique-item.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

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

  test("should return true", async () => {
    getUniqueItemStub.resolves({ blid: "blid1" } as UniqueItem);

    getActiveCustomerItemsStub.resolves([]);

    return expect(
      // @ts-expect-error fixme missing params
      uniqueItemActiveOperation.run({ documentId: "uniqueItem1" }),
    ).to.eventually.be.true;
  });
});
