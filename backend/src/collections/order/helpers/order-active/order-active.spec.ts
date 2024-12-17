import "mocha";
import { BlError, Order } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { BlCollectionName } from "@/collections/bl-collection";
import { OrderActive } from "@/collections/order/helpers/order-active/order-active";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

chai.use(chaiAsPromised);

describe("OrderActive", () => {
  const orderStorage = new BlDocumentStorage<Order>(BlCollectionName.Orders);
  const getOrderByQueryStub = sinon.stub(orderStorage, "getByQuery");
  const orderActive = new OrderActive(orderStorage);
  const testUserId = "5d765db5fc8c47001c408d8d";

  beforeEach(() => {
    getOrderByQueryStub.reset();
  });

  describe("haveActiveOrders()", () => {
    it("should resolve with false if no orders was found", () => {
      getOrderByQueryStub.rejects(new BlError("not found").code(702));

      return expect(orderActive.haveActiveOrders(testUserId)).to.eventually.be
        .false;
    });

    it("should resolve with false if orders was found but none was active", () => {
      const nonActiveOrder: Order = {
        id: "order1",
        amount: 100,
        orderItems: [],
        branch: "branch1",
        customer: testUserId,
        byCustomer: true,
        placed: false,
        pendingSignature: false,
      };

      getOrderByQueryStub.resolves([nonActiveOrder]);

      return expect(orderActive.haveActiveOrders(testUserId)).to.eventually.be
        .false;
    });

    it("should resolve with true if orders was found and at least one was active", () => {
      const nonActiveOrder: Order = {
        id: "order1",
        amount: 100,
        orderItems: [],
        branch: "branch1",
        customer: testUserId,
        byCustomer: true,
        placed: false,
        pendingSignature: false,
      };

      const activeOrder: Order = {
        id: "order2",
        amount: 200,
        orderItems: [
          {
            type: "partly-payment",
            item: "item1",
            title: "title 1",
            amount: 100,
            unitPrice: 100,
            taxRate: 0,
            taxAmount: 0,
            handout: false,
            delivered: false,
          },
        ],
        branch: "branch1",
        customer: testUserId,
        byCustomer: true,
        placed: true,
        pendingSignature: false,
      };

      getOrderByQueryStub.resolves([nonActiveOrder, activeOrder]);

      return expect(orderActive.haveActiveOrders(testUserId)).to.eventually.be
        .true;
    });

    it("should resolve with false if orders was found and all order-items was handed out", () => {
      const nonActiveOrder: Order = {
        id: "order1",
        amount: 100,
        orderItems: [
          {
            type: "partly-payment",
            item: "item1",
            title: "title 1",
            amount: 100,
            unitPrice: 100,
            taxRate: 0,
            taxAmount: 0,
            handout: true,
            delivered: false,
          },
        ],
        branch: "branch1",
        customer: testUserId,
        byCustomer: true,
        placed: true,
        pendingSignature: false,
      };

      const nonActiveOrder2: Order = {
        id: "order2",
        amount: 200,
        orderItems: [
          {
            type: "partly-payment",
            item: "item1",
            title: "title 1",
            amount: 100,
            unitPrice: 100,
            taxRate: 0,
            taxAmount: 0,
            handout: true,
            delivered: false,
          },
        ],
        branch: "branch1",
        customer: testUserId,
        byCustomer: true,
        placed: true,
        pendingSignature: false,
      };

      getOrderByQueryStub.resolves([nonActiveOrder, nonActiveOrder2]);

      return expect(orderActive.haveActiveOrders(testUserId)).to.eventually.be
        .false;
    });
  });
});
