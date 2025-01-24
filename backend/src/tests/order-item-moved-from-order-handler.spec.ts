import { OrderItemMovedFromOrderHandler } from "@backend/lib/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Order } from "@shared/order/order.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("OrderItemMovedFromOrderHandler", (group) => {
  const oiMovedFromOrderHandler = new OrderItemMovedFromOrderHandler();
  let getOrderStub: sinon.SinonStub;
  let updateOrderStub: sinon.SinonStub;

  let sandbox: sinon.SinonSandbox;
  group.each.setup(() => {
    sandbox = createSandbox();
    const orderStub = {
      get: sandbox.stub(),
      update: sandbox.stub(),
    };

    sandbox.stub(BlStorage, "Orders").value(orderStub);
    getOrderStub = orderStub.get;
    updateOrderStub = orderStub.update;
    getOrderStub.withArgs(testMovedFromOrderId).resolves(testMovedFromOrder);
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  const testMovedFromOrderId = "testMovedFromOrderId";

  const testMovedFromOrder = {
    amount: 100,
    orderItems: [
      {
        type: "rent",
        item: "item2",
        title: "Signatur 3: Tekstsammling",
        amount: 100,
        unitPrice: 100,
        taxRate: 0,
        taxAmount: 0,
        info: {
          from: new Date(),
          to: new Date(),
          numberOfPeriods: 1,
          periodType: "semester",
        },
      },
    ],
  } as Order;

  const order = {
    id: "testOrder1",
    amount: 0,
    orderItems: [
      {
        type: "rent",
        item: "item2",
        title: "Signatur 3: Tekstsammling",
        amount: 0,
        unitPrice: 0,
        taxRate: 0,
        movedFromOrder: testMovedFromOrderId,
        taxAmount: 0,
        info: {
          from: new Date(),
          to: new Date(),
          numberOfPeriods: 1,
          periodType: "semester",
        },
      },
    ],
    branch: "branch1",
    customer: "customer1",
    byCustomer: false,
  } as Order;

  test('should update the last orderItem with "movedToOrder"', async () => {
    getOrderStub.withArgs(testMovedFromOrderId).resolves(testMovedFromOrder);
    updateOrderStub.resolves(testMovedFromOrder);

    oiMovedFromOrderHandler.updateOrderItems(order).then(() => {
      return expect(updateOrderStub).to.have.been.called;
    });
  });

  test('should reject if original order item already have "movedToOrder"', async () => {
    // @ts-expect-error fixme: auto ignored
    testMovedFromOrder.orderItems[0]["movedToOrder"] = "anotherOrder";
    getOrderStub.withArgs(testMovedFromOrderId).resolves(testMovedFromOrder);
    updateOrderStub.resolves(testMovedFromOrder);

    return expect(
      oiMovedFromOrderHandler.updateOrderItems(order),
    ).to.be.rejectedWith(BlError, /orderItem has "movedToOrder" already set/);
  });
});
