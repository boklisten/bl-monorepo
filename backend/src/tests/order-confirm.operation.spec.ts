import { OrderPlacedHandler } from "@backend/collections/order/helpers/order-placed-handler/order-placed-handler.js";
import { OrderConfirmOperation } from "@backend/collections/order/operations/confirm/order-confirm.operation.js";
import BlResponseHandler from "@backend/response/bl-response.handler.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();

describe("OrderConfirmOperation", () => {
  const orderPlacedHandler = new OrderPlacedHandler();

  let orderGetStub: sinon.SinonStub;

  const orderConfirmOperation = new OrderConfirmOperation(orderPlacedHandler);
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = createSandbox();
    orderGetStub = sandbox.stub(BlStorage.Orders, "get");
    sandbox.stub(orderPlacedHandler, "placeOrder");
    sandbox.stub(BlResponseHandler, "sendResponse");
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("run()", () => {
    it("should reject if order is not found", () => {
      orderGetStub.rejects(new BlError("not found").code(702));

      return expect(
        // @ts-expect-error fixme missing params
        orderConfirmOperation.run({
          documentId: "order1",
          user: { id: "user1", permission: "customer", details: "" },
        }),
      ).to.eventually.be.rejectedWith(BlError, /order "order1" not found/);
    });
  });
});
