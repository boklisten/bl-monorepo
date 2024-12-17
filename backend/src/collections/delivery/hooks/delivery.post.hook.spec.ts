import "mocha";
import {
  BlError,
  Delivery,
  Item,
  Order,
  AccessToken,
} from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { BlCollectionName } from "@/collections/bl-collection";
import { deliverySchema } from "@/collections/delivery/delivery.schema";
import { DeliveryHandler } from "@/collections/delivery/helpers/deliveryHandler/delivery-handler";
import { DeliveryValidator } from "@/collections/delivery/helpers/deliveryValidator/delivery-validator";
import { DeliveryPostHook } from "@/collections/delivery/hooks/delivery.post.hook";
import { itemSchema } from "@/collections/item/item.schema";
import { orderSchema } from "@/collections/order/order.schema";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

chai.use(chaiAsPromised);

describe("DeliveryPostHook", () => {
  const deliveryStorage = new BlDocumentStorage<Delivery>(
    BlCollectionName.Deliveries,
    deliverySchema,
  );
  const orderStorage = new BlDocumentStorage<Order>(
    BlCollectionName.Orders,
    orderSchema,
  );
  const itemStorage = new BlDocumentStorage<Item>(
    BlCollectionName.Items,
    itemSchema,
  );
  const deliveryValidator = new DeliveryValidator();
  const deliveryHandler = new DeliveryHandler();
  const deliveryPostHook = new DeliveryPostHook(
    deliveryValidator,
    deliveryHandler,
    deliveryStorage,
    orderStorage,
    itemStorage,
  );

  let testDelivery: Delivery;
  let testOrder: Order;
  let testItem: Item;
  let testAccessToken: AccessToken;
  let orderUpdated = true;

  let deliveryValidated = true;

  beforeEach(() => {
    orderUpdated = true;
    deliveryValidated = true;

    testDelivery = {
      id: "delivery1",
      method: "bring",
      amount: 100,
      order: "order1",
      info: {
        branch: "branch1",
      },
    };

    testAccessToken = {
      iss: "boklisten.co",
      aud: "boklisten.co",
      iat: 1234,
      exp: 2345,
      sub: "user1",
      username: "a@b.com",
      permission: "customer",
      details: "details1",
    };

    testItem = {
      id: "item1",
      title: "signatur 3",
      type: "book",
      price: 100,
      taxRate: 0,

      buyback: false,
      categories: [],
      digital: false,
      info: {
        isbn: 0,
        subject: "",
        year: 0,
        price: {},
        weight: "",
        distributor: "",
        discount: 0,
        publisher: "",
      },
    };

    testOrder = {
      id: "order1",
      customer: "customer1",
      amount: 100,
      byCustomer: true,
      branch: "branch1",
      pendingSignature: false,
      orderItems: [
        {
          item: "item1",
          title: "signatur 3",
          amount: 100,
          unitPrice: 100,
          taxAmount: 0,
          taxRate: 0,
          type: "buy",
        },
      ],
      payments: [],
      delivery: "",
    };
  });

  sinon
    .stub(deliveryValidator, "validate") // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .callsFake((delivery: Delivery, order: Order) => {
      if (!deliveryValidated) {
        return Promise.reject(new BlError("delivery could not be validated"));
      }
      return Promise.resolve(true);
    });

  sinon
    .stub(deliveryHandler, "updateOrderBasedOnMethod")
    .callsFake((delivery, order, accessToken) => {
      return Promise.reject(new BlError("order could not be updated"));
    });

  sinon.stub(deliveryStorage, "get").callsFake((id: string) => {
    return new Promise((resolve, reject) => {
      if (id === "delivery1") {
        return resolve(testDelivery);
      }
      return reject(new BlError("not found").code(702));
    });
  });

  sinon.stub(orderStorage, "get").callsFake((id: string) => {
    return new Promise((resolve, reject) => {
      if (id === "order1") {
        return resolve(testOrder);
      }
      return reject(new BlError("not found").code(702));
    });
  });

  sinon.stub(itemStorage, "getMany").callsFake((ids: string[]) => {
    return new Promise((resolve, reject) => {
      if (ids[0] === "item1") {
        return resolve([testItem]);
      }
      return reject(new BlError("not found").code(702));
    });
  });

  describe("#after()", () => {
    it("should reject if deliveryIds is empty or undefined", (done) => {
      deliveryPostHook.after([]).catch((blError) => {
        expect(blError.getMsg()).to.contain("deliveries is empty or undefined");
        done();
      });
    });

    it("should reject if delivery.order is not found", (done) => {
      testDelivery.order = "notFoundOrder";

      deliveryPostHook
        .after([testDelivery], testAccessToken)
        .catch((blError: BlError) => {
          expect(blError.getCode()).to.be.eql(702);

          expect(blError.getMsg()).to.contain(`not found`);

          done();
        });
    });

    it("should reject if deliveryValidator.validate rejects", () => {
      deliveryValidated = false;

      return expect(
        deliveryPostHook.after([testDelivery], testAccessToken),
      ).to.be.rejectedWith(BlError, /delivery could not be validated/);
    });

    it("should reject if DeliveryHandler.updateOrderBasedOnMethod rejects", () => {
      orderUpdated = false;

      return expect(
        deliveryPostHook.after([testDelivery], testAccessToken),
      ).to.be.rejectedWith(BlError, /order could not be updated/);
    });
  });
});
