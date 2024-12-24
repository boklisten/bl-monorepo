import "mocha";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { OrderItemMovedFromOrderHandler } from "@backend/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("OrderItemMovedFromOrderHandler", () => {
  const orderStorage = new BlDocumentStorage<Order>(BlCollectionName.Orders);
  const oiMovedFromOrderHandler = new OrderItemMovedFromOrderHandler(
    orderStorage,
  );
  const getOrderStub = sinon.stub(orderStorage, "get");
  const updateOrderStub = sinon.stub(orderStorage, "update");

  describe("#updateOrderItems", () => {
    context('when "movedFromOrder" is present on order items', () => {
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

      getOrderStub.withArgs(testMovedFromOrderId).resolves(testMovedFromOrder);

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

      it('should update the last orderItem with "movedToOrder"', (done) => {
        getOrderStub
          .withArgs(testMovedFromOrderId)
          .resolves(testMovedFromOrder);
        updateOrderStub.resolves(testMovedFromOrder);

        oiMovedFromOrderHandler
          .updateOrderItems(order)
          .then(() => {
            expect(updateOrderStub).to.have.been.called;
            done();
          })
          .catch((err) => {
            done(new Error(err));
          });
      });

      it('should reject if original order item already have "movedToOrder"', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testMovedFromOrder.orderItems[0]["movedToOrder"] = "anotherOrder";
        getOrderStub
          .withArgs(testMovedFromOrderId)
          .resolves(testMovedFromOrder);
        updateOrderStub.resolves(testMovedFromOrder);

        return expect(
          oiMovedFromOrderHandler.updateOrderItems(order),
        ).to.be.rejectedWith(
          BlError,
          /orderItem has "movedToOrder" already set/,
        );
      });
    });
  });
});
