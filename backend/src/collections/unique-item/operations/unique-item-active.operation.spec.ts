import "mocha";
import { UniqueItem } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { BlCollectionName } from "@/collections/bl-collection";
import { CustomerItemActiveBlid } from "@/collections/customer-item/helpers/customer-item-active-blid";
import { UniqueItemActiveOperation } from "@/collections/unique-item/operations/unique-item-active.operation";
import { SEResponseHandler } from "@/response/se.response.handler";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

chai.use(chaiAsPromised);

describe("UniqueItemActiveOperation", () => {
  describe("run()", () => {
    const customerItemActiveBlid = new CustomerItemActiveBlid();
    const uniqueItemStorage = new BlDocumentStorage<UniqueItem>(
      BlCollectionName.UniqueItems,
    );

    const getActiveCustomerItemsStub = sinon.stub(
      customerItemActiveBlid,
      "getActiveCustomerItems",
    );

    const getUniqueItemStub = sinon.stub(uniqueItemStorage, "get");

    const resHandler = new SEResponseHandler();

    const uniqueItemActiveOperation = new UniqueItemActiveOperation(
      customerItemActiveBlid,
      uniqueItemStorage,
      resHandler,
    );

    sinon.stub(resHandler, "sendResponse").resolves(true);

    beforeEach(() => {
      getUniqueItemStub.reset();
    });

    it("should return true", () => {
      getUniqueItemStub.resolves({ blid: "blid1" } as UniqueItem);

      getActiveCustomerItemsStub.resolves([]);

      return expect(
        uniqueItemActiveOperation.run({ documentId: "uniqueItem1" }),
      ).to.eventually.be.true;
    });
  });
});
