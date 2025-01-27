import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { OrderPlacedHandler } from "#services/collections/order/helpers/order-placed-handler/order-placed-handler";
import { OrderConfirmOperation } from "#services/collections/order/operations/confirm/order-confirm.operation";
import BlResponseHandler from "#services/response/bl-response.handler";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
chaiUse(chaiAsPromised);
should();

test.group("OrderConfirmOperation", (group) => {
  const orderPlacedHandler = new OrderPlacedHandler();

  let orderGetStub: sinon.SinonStub;

  const orderConfirmOperation = new OrderConfirmOperation(orderPlacedHandler);
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    orderGetStub = sandbox.stub(BlStorage.Orders, "get");
    sandbox.stub(orderPlacedHandler, "placeOrder");
    sandbox.stub(BlResponseHandler, "sendResponse");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if order is not found", async () => {
    orderGetStub.rejects(new BlError("not found").code(702));

    return expect(
      orderConfirmOperation.run({
        documentId: "order1",
        user: { id: "user1", permission: "customer", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /order "order1" not found/);
  });
});
