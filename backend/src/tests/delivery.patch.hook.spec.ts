import "mocha";

import { DeliveryValidator } from "@backend/collections/delivery/helpers/deliveryValidator/delivery-validator.js";
import { DeliveryPatchHook } from "@backend/collections/delivery/hooks/delivery.patch.hook.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Delivery } from "@shared/delivery/delivery.js";
import { Order } from "@shared/order/order.js";
import { AccessToken } from "@shared/token/access-token.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("DeliveryPatchHook", () => {
  const deliveryValidator = new DeliveryValidator();
  const deliveryPatchHook = new DeliveryPatchHook(deliveryValidator);

  let testRequest: any;
  let testDelivery: Delivery;
  let testAccessToken: AccessToken;
  let testOrder: Order;
  let deliveryValidated = true;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    testOrder = {
      id: "order1",
      amount: 100,
      orderItems: [],
      branch: "branch1",
      customer: "customer1",
      byCustomer: true,
      delivery: "delivery1",
      pendingSignature: false,
    };

    deliveryValidated = true;

    testAccessToken = {
      iss: "boklisten.no",
      aud: "boklisten.no",
      iat: 123,
      exp: 323,
      sub: "user1",
      username: "a@b.com",
      permission: "customer",
      details: "userDetails1",
    };

    testDelivery = {
      id: "delivery1",
      method: "branch",
      info: {
        branch: "branch1",
      },
      order: "order1",
      amount: 0,
    };

    testRequest = {
      method: "bring",
      info: {
        from: "0560",
        to: "7070",
      },
      order: "order1",
      amount: 0,
    };

    sandbox = createSandbox();
    sandbox.stub(BlStorage.Deliveries, "get").callsFake((id) => {
      if (id !== testDelivery.id) {
        return Promise.reject(new BlError("not found").code(702));
      }
      return Promise.resolve(testDelivery);
    });

    sandbox.stub(BlStorage.Orders, "get").callsFake((id) => {
      if (id !== testOrder.id) {
        return Promise.reject(new BlError("not found").code(702));
      }
      return Promise.resolve(testOrder);
    });

    sandbox
      .stub(deliveryValidator, "validate")
      .callsFake((delivery: Delivery) => {
        if (!deliveryValidated) {
          return Promise.reject(new BlError("could not validate delivery"));
        }
        return Promise.resolve(true);
      });
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("before()", () => {
    it("should resolve if all parameters are valid", () => {
      return expect(
        deliveryPatchHook.before(testRequest, testAccessToken, "delivery1"),
      ).to.be.fulfilled;
    });

    it("should reject if id is undefined", () => {
      return expect(
        deliveryPatchHook.before(testRequest, testAccessToken, undefined),
      ).to.be.rejectedWith(BlError, /id is undefined/);
    });

    it("should reject if body is empty or undefined", () => {
      return expect(
        deliveryPatchHook.before(null, testAccessToken, "delivery1"),
      ).to.be.rejectedWith(BlError, /body is undefined/);
    });

    it("should reject if accessToken is empty or undefined", () => {
      return expect(
        deliveryPatchHook.before(testRequest, undefined, "delivery1"),
      ).to.be.rejectedWith(BlError, /accessToken is undefined/);
    });

    it("should reject if delivery is not found", () => {
      return expect(
        deliveryPatchHook.before(
          testRequest,
          testAccessToken,
          "deliveryNotFound",
        ),
      ).to.be.rejectedWith(BlError, /delivery "deliveryNotFound" not found/);
    });

    it("should reject if deliveryValidator fails", () => {
      deliveryValidated = false;

      return expect(
        deliveryPatchHook.before(testRequest, testAccessToken, "delivery1"),
      ).to.be.rejectedWith(BlError, /patched delivery could not be validated/);
    });
  });
});
