import { DeliveryHandler } from "@backend/collections/delivery/helpers/deliveryHandler/delivery-handler.js";
import { DeliveryValidator } from "@backend/collections/delivery/helpers/deliveryValidator/delivery-validator.js";
import { DeliveryPostHook } from "@backend/collections/delivery/hooks/delivery.post.hook.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Delivery } from "@shared/delivery/delivery.js";
import { Item } from "@shared/item/item.js";
import { Order } from "@shared/order/order.js";
import { AccessToken } from "@shared/token/access-token.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("DeliveryPostHook", () => {
  const deliveryValidator = new DeliveryValidator();
  const deliveryHandler = new DeliveryHandler();
  const deliveryPostHook = new DeliveryPostHook(
    deliveryValidator,
    deliveryHandler,
  );

  let testDelivery: Delivery;
  let testOrder: Order;
  let testItem: Item;
  let testAccessToken: AccessToken;
  let orderUpdated = true;

  let deliveryValidated = true;
  let sandbox: sinon.SinonSandbox;

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
      price: 100,
      taxRate: 0,

      buyback: false,
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

    sandbox = createSandbox();
    sandbox
      .stub(deliveryValidator, "validate")
      .callsFake((delivery: Delivery) => {
        if (!deliveryValidated) {
          return Promise.reject(new BlError("delivery could not be validated"));
        }
        return Promise.resolve(true);
      });

    sandbox
      .stub(deliveryHandler, "updateOrderBasedOnMethod")
      .callsFake((delivery, order) => {
        return Promise.reject(new BlError("order could not be updated"));
      });

    sandbox.stub(BlStorage.Deliveries, "get").callsFake((id) => {
      return new Promise((resolve, reject) => {
        if (id === "delivery1") {
          return resolve(testDelivery);
        }
        return reject(new BlError("not found").code(702));
      });
    });

    sandbox.stub(BlStorage.Orders, "get").callsFake((id) => {
      return new Promise((resolve, reject) => {
        if (id === "order1") {
          return resolve(testOrder);
        }
        return reject(new BlError("not found").code(702));
      });
    });

    sandbox.stub(BlStorage.Items, "getMany").callsFake((ids: string[]) => {
      return new Promise((resolve, reject) => {
        if (ids[0] === "item1") {
          return resolve([testItem]);
        }
        return reject(new BlError("not found").code(702));
      });
    });
  });
  afterEach(() => {
    sandbox.restore();
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
