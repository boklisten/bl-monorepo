import "mocha";

import { BlCollectionName } from "@backend/collections/bl-collection";
import { DeliveryHandler } from "@backend/collections/delivery/helpers/deliveryHandler/delivery-handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

let testOrder: Order;
let testDelivery: Delivery;
const orderStorage = new BlDocumentStorage<Order>(BlCollectionName.Orders);
let canUpdateOrder = true;

const deliveryHandler = new DeliveryHandler(orderStorage);

describe("DeliveryHandler", () => {
  beforeEach(() => {
    testOrder = {
      id: "order1",
      amount: 100,
      orderItems: [],
      branch: "branch1",
      customer: "customer1",
      byCustomer: true,
      pendingSignature: false,
    };

    testDelivery = {
      id: "delivery1",
      method: "bring",
      amount: 100,
      order: "order1",
      info: {
        amount: 100,
        estimatedDelivery: new Date(),
        taxAmount: 0,
        from: "0450",
        to: "0560",
      },
    };
  });
  sinon.stub(orderStorage, "update").callsFake((id: string, data: any) => {
    if (!canUpdateOrder) {
      return Promise.reject(new BlError("could not update"));
    }
    return Promise.resolve(testOrder);
  });

  describe("updateOrderBasedOnMethod()", () => {
    it("should reject if OrderStorage.update rejects", () => {
      testDelivery.method = "branch";
      canUpdateOrder = false;

      return expect(
        deliveryHandler.updateOrderBasedOnMethod(testDelivery, testOrder),
      ).to.be.rejectedWith(BlError, /could not update/);
    });
  });
});
