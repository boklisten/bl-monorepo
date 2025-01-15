import "mocha";

import { DeliveryModel } from "@backend/collections/delivery/delivery.model";
import { DeliveryValidator } from "@backend/collections/delivery/helpers/deliveryValidator/delivery-validator";
import { DeliveryPatchHook } from "@backend/collections/delivery/hooks/delivery.patch.hook";
import { OrderModel } from "@backend/collections/order/order.model";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { AccessToken } from "@shared/token/access-token";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("DeliveryPatchHook", () => {
  const deliveryStorage = new BlStorage(DeliveryModel);
  const deliveryValidator = new DeliveryValidator();
  const orderStorage = new BlStorage(OrderModel);
  const deliveryPatchHook = new DeliveryPatchHook(
    deliveryValidator,
    deliveryStorage,
    orderStorage,
  );

  let testRequest: any;
  let testDelivery: Delivery;
  let testAccessToken: AccessToken;
  let testOrder: Order;
  let deliveryValidated = true;

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
  });

  sinon.stub(deliveryStorage, "get").callsFake((id: string) => {
    if (id !== testDelivery.id) {
      return Promise.reject(new BlError("not found").code(702));
    }
    return Promise.resolve(testDelivery);
  });

  sinon.stub(orderStorage, "get").callsFake((id: string) => {
    if (id !== testOrder.id) {
      return Promise.reject(new BlError("not found").code(702));
    }
    return Promise.resolve(testOrder);
  });

  sinon.stub(deliveryValidator, "validate").callsFake((delivery: Delivery) => {
    if (!deliveryValidated) {
      return Promise.reject(new BlError("could not validate delivery"));
    }
    return Promise.resolve(true);
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
