import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Order } from "@shared/order/order.js";
import { AccessToken } from "@shared/token/access-token.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { OrderPlacedHandler } from "#services/collections/order/helpers/order-placed-handler/order-placed-handler";
import { OrderValidator } from "#services/collections/order/helpers/order-validator/order-validator";
import { OrderPatchHook } from "#services/collections/order/hooks/order.patch.hook";
import { BlStorage } from "#services/storage/bl-storage";

chaiUse(chaiAsPromised);
should();

test.group("OrderPatchHook", (group) => {
  const orderValidator = new OrderValidator();
  const orderPlacedHandler = new OrderPlacedHandler();
  const orderPatchHook = new OrderPatchHook(orderValidator, orderPlacedHandler);

  let testAccessToken: AccessToken;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let testRequestBody: any;
  let testOrder: Order;
  let orderUpdated = true;
  let orderValidated = true;
  let userDetailUpdated = true;
  let testUserDetail: UserDetail;
  let orderPlacedConfirmed: boolean;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    testRequestBody = {
      placed: true,
    };

    orderUpdated = true;
    orderValidated = true;
    userDetailUpdated = true;
    orderPlacedConfirmed = true;

    testUserDetail = {
      id: "userDetail1",
      name: "albert",
      email: "bill@b.com",
      phone: "1241234",
      address: "",
      postCode: "123",
      postCity: "oslo",
      country: "norway",
      dob: new Date(),
      branch: "branch1",
      orders: [],
      signatures: [],
      blid: "",
    };

    testOrder = {
      id: "order1",
      amount: 100,
      orderItems: [],
      branch: "branch1",
      customer: "customer1",
      byCustomer: true,
      placed: false,
      pendingSignature: false,
    };

    testAccessToken = {
      iss: "boklisten.no",
      aud: "boklisten.no",
      iat: 123,
      exp: 123,
      sub: "user1",
      username: "billy@bob.com",
      permission: "customer",
      details: "userDetail1",
    };

    sandbox = createSandbox();
    sandbox.stub(BlStorage.Orders, "get").callsFake((id) => {
      if (id !== testOrder.id) {
        return Promise.reject(new BlError("not found").code(702));
      }
      return Promise.resolve(testOrder);
    });

    sandbox.stub(orderPlacedHandler, "placeOrder").callsFake(() => {
      if (!orderPlacedConfirmed) {
        return Promise.reject(new BlError("could not place order"));
      }
      return Promise.resolve({} as Order);
    });

    sandbox.stub(BlStorage.UserDetails, "update").callsFake((id, data) => {
      if (!userDetailUpdated) {
        return Promise.reject(new BlError("could not update"));
      }

      if (data["orders"]) {
        testUserDetail.orders = data["orders"];
      }

      return Promise.resolve({} as UserDetail);
    });

    sandbox.stub(BlStorage.UserDetails, "get").callsFake((id) => {
      if (id !== testUserDetail.id) {
        return Promise.reject(new BlError("not found").code(702));
      }
      return Promise.resolve(testUserDetail);
    });

    sandbox.stub(BlStorage.Orders, "update").callsFake(() => {
      if (!orderUpdated) {
        return Promise.reject("could not update");
      }
      return Promise.resolve(testOrder);
    });

    sandbox
      .stub(orderValidator, "validate")

      .callsFake(() => {
        if (!orderValidated) {
          return Promise.reject(new BlError("could not validate"));
        }
        return Promise.resolve(true);
      });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if body is empty or undefined", async () => {
    return expect(
      orderPatchHook.before(undefined, testAccessToken, "order1"),
    ).to.be.rejectedWith(BlError, /body not defined/);
  });

  test("should reject if accessToken is empty or undefined", async () => {
    return expect(
      // @ts-expect-error fixme: auto ignored
      orderPatchHook.before({ placed: true }, undefined, "order1"),
    ).to.be.rejectedWith(BlError, /accessToken not defined/);
  });

  test("should reject if id is not defined", async () => {
    return expect(
      // @ts-expect-error fixme: auto ignored
      orderPatchHook.before(testRequestBody, testAccessToken, null),
    ).to.be.rejectedWith(BlError, /id not defined/);
  });

  test("should reject if accessToken is not defined", async () => {
    return expect(
      // @ts-expect-error fixme: auto ignored
      orderPatchHook.after([testOrder], undefined),
    ).to.be.rejectedWith(BlError, /accessToken not defined/);
  });

  test("should reject if OrderPlaced.placeOrder rejects", async ({
    assert,
  }) => {
    testOrder.placed = true;
    orderPlacedConfirmed = false;

    return assert.rejects(
      () => orderPatchHook.after([testOrder], testAccessToken),
      "order could not be placed",
    );
  });
});
