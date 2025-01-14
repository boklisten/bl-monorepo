import "mocha";

import { OrderPlacedHandler } from "@backend/collections/order/helpers/order-placed-handler/order-placed-handler";
import { OrderConfirmOperation } from "@backend/collections/order/operations/confirm/order-confirm.operation";
import { OrderModel } from "@backend/collections/order/order.model";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
chaiUse(chaiAsPromised);
should();

describe("OrderConfirmOperation", () => {
  const resHandler = new SEResponseHandler();
  const orderStorage = new BlDocumentStorage(OrderModel);
  const orderPlacedHandler = new OrderPlacedHandler();

  const orderGetStub = sinon.stub(orderStorage, "get");
  const orderPlaceStub = sinon.stub(orderPlacedHandler, "placeOrder");
  const sendResponseStub = sinon.stub(resHandler, "sendResponse");

  const orderConfirmOperation = new OrderConfirmOperation(
    resHandler,
    orderStorage,
    orderPlacedHandler,
  );

  beforeEach(() => {
    orderGetStub.reset();
    sendResponseStub.reset();
    orderPlaceStub.reset();
  });

  describe("run()", () => {
    it("should reject if order is not found", () => {
      orderGetStub.rejects(new BlError("not found").code(702));

      return expect(
        orderConfirmOperation.run({
          documentId: "order1",
          user: { id: "user1", permission: "customer", details: "" },
        }),
      ).to.eventually.be.rejectedWith(BlError, /order "order1" not found/);
    });
  });
});
