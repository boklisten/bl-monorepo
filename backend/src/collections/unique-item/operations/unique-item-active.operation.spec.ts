import "mocha";

import { CustomerItemActiveBlid } from "@backend/collections/customer-item/helpers/customer-item-active-blid";
import { UniqueItemActiveOperation } from "@backend/collections/unique-item/operations/unique-item-active.operation";
import { UniqueItemModel } from "@backend/collections/unique-item/unique-item.model";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/blStorage";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("UniqueItemActiveOperation", () => {
  describe("run()", () => {
    const customerItemActiveBlid = new CustomerItemActiveBlid();
    const uniqueItemStorage = new BlStorage(UniqueItemModel);

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
        // @ts-expect-error fixme missing params
        uniqueItemActiveOperation.run({ documentId: "uniqueItem1" }),
      ).to.eventually.be.true;
    });
  });
});
