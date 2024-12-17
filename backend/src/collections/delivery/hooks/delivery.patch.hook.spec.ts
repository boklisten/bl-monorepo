import "mocha";
import { BlError, Delivery, Order, AccessToken } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { BlCollectionName } from "@/collections/bl-collection";
import { DeliveryValidator } from "@/collections/delivery/helpers/deliveryValidator/delivery-validator";
import { DeliveryPatchHook } from "@/collections/delivery/hooks/delivery.patch.hook";
import { orderSchema } from "@/collections/order/order.schema";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

chai.use(chaiAsPromised);

describe("DeliveryPatchHook", () => {
  const deliveryStorage = new BlDocumentStorage<Delivery>(
    BlCollectionName.Deliveries,
  );
  const deliveryValidator = new DeliveryValidator();
  const orderStorage = new BlDocumentStorage<Order>(
    BlCollectionName.Orders,
    orderSchema,
  );
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

  sinon
    .stub(deliveryValidator, "validate") // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .callsFake((delivery: Delivery, order: Order) => {
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

    it("should reject if order is not found", () => {
      return expect(
        deliveryPatchHook.before(
          { order: "notFoundOrder" },
          testAccessToken,
          "delivery1",
        ),
      ).to.be.rejectedWith(BlError, /order "notFoundOrder" not found/);
    });

    it("should reject if deliveryValidator fails", () => {
      deliveryValidated = false;

      return expect(
        deliveryPatchHook.before(testRequest, testAccessToken, "delivery1"),
      ).to.be.rejectedWith(BlError, /patched delivery could not be validated/);
    });
  });
});
