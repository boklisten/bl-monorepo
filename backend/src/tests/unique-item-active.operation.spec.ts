import "mocha";

import { CustomerItemActiveBlid } from "@backend/collections/customer-item/helpers/customer-item-active-blid.js";
import { UniqueItemActiveOperation } from "@backend/collections/unique-item/operations/unique-item-active.operation.js";
import BlResponseHandler from "@backend/response/bl-response.handler.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { UniqueItem } from "@shared/unique-item/unique-item.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("UniqueItemActiveOperation", () => {
  describe("run()", () => {
    const customerItemActiveBlid = new CustomerItemActiveBlid();

    const uniqueItemActiveOperation = new UniqueItemActiveOperation(
      customerItemActiveBlid,
    );

    let sandbox: sinon.SinonSandbox;
    let getUniqueItemStub: sinon.SinonStub;
    let getActiveCustomerItemsStub: sinon.SinonStub;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(BlResponseHandler, "sendResponse").resolves(true);
      getActiveCustomerItemsStub = sandbox.stub(
        customerItemActiveBlid,
        "getActiveCustomerItems",
      );

      getUniqueItemStub = sandbox.stub(BlStorage.UniqueItems, "get");
    });
    afterEach(() => {
      sandbox.restore();
    });

    it("should return true", () => {
      getUniqueItemStub.resolves({ blid: "blid1" } as UniqueItem);

      getActiveCustomerItemsStub.resolves([]);

      return expect(
        // @ts-expect-error fixme missing params
        uniqueItemActiveOperation.run({ documentId: "uniqueItem1" }),
      ).to.eventually.be.true;
    });
  });
});
