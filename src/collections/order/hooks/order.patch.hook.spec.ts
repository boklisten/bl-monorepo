import "mocha";
import { BlError, AccessToken, UserDetail, Order } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { BlCollectionName } from "@/collections/bl-collection";
import { OrderPlacedHandler } from "@/collections/order/helpers/order-placed-handler/order-placed-handler";
import { OrderValidator } from "@/collections/order/helpers/order-validator/order-validator";
import { OrderPatchHook } from "@/collections/order/hooks/order.patch.hook";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

chai.use(chaiAsPromised);

describe("OrderPatchHook", () => {
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const orderStorage = new BlDocumentStorage<Order>(BlCollectionName.Orders);
  const orderValidator = new OrderValidator();
  const orderPlacedHandler = new OrderPlacedHandler();
  const orderPatchHook = new OrderPatchHook(
    userDetailStorage,
    orderStorage,
    orderValidator,
    orderPlacedHandler,
  );

  let testAccessToken: AccessToken;
  let testRequestBody: any;
  let testOrder: Order;
  let orderUpdated = true;
  let orderValidated = true;
  let userDetailUpdated = true;
  let testUserDetail: UserDetail;
  let orderPlacedConfirmed: boolean;

  beforeEach(() => {
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
  });

  sinon.stub(orderStorage, "get").callsFake((id: string) => {
    if (id !== testOrder.id) {
      return Promise.reject(new BlError("not found").code(702));
    }
    return Promise.resolve(testOrder);
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sinon.stub(orderPlacedHandler, "placeOrder").callsFake((order: Order) => {
    if (!orderPlacedConfirmed) {
      return Promise.reject(new BlError("could not place order"));
    }
    return Promise.resolve({} as Order);
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userDetailStorageUpdateStub = sinon
    .stub(userDetailStorage, "update") // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .callsFake((id: string, data: any, user: any) => {
      if (!userDetailUpdated) {
        return Promise.reject(new BlError("could not update"));
      }

      if (data["orders"]) {
        testUserDetail.orders = data["orders"];
      }

      return Promise.resolve({} as UserDetail);
    });

  sinon.stub(userDetailStorage, "get").callsFake((id: string) => {
    if (id !== testUserDetail.id) {
      return Promise.reject(new BlError("not found").code(702));
    }
    return Promise.resolve(testUserDetail);
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const orderStorageUpdateStub = sinon
    .stub(orderStorage, "update") // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .callsFake((id: string, data: any, user: any) => {
      if (!orderUpdated) {
        return Promise.reject("could not update");
      }
      return Promise.resolve(testOrder);
    });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const orderValidationValidateStub = sinon
    .stub(orderValidator, "validate")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .callsFake((order: Order) => {
      if (!orderValidated) {
        return Promise.reject(new BlError("could not validate"));
      }
      return Promise.resolve(true);
    });

  describe("before()", () => {
    it("should reject if body is empty or undefined", () => {
      return expect(
        orderPatchHook.before(undefined, testAccessToken, "order1"),
      ).to.be.rejectedWith(BlError, /body not defined/);
    });

    it("should reject if accessToken is empty or undefined", () => {
      return expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        orderPatchHook.before({ placed: true }, undefined, "order1"),
      ).to.be.rejectedWith(BlError, /accessToken not defined/);
    });

    it("should reject if id is not defined", () => {
      return expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        orderPatchHook.before(testRequestBody, testAccessToken, null),
      ).to.be.rejectedWith(BlError, /id not defined/);
    });
  });

  describe("after()", () => {
    it("should reject if accessToken is not defined", () => {
      return expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        orderPatchHook.after([testOrder], undefined),
      ).to.be.rejectedWith(BlError, /accessToken not defined/);
    });

    context("when order.placed is true", () => {
      beforeEach(() => {
        testOrder.placed = true;
      });

      it("should reject if OrderPlaced.placeOrder rejects", () => {
        orderPlacedConfirmed = false;

        return expect(
          orderPatchHook.after([testOrder], testAccessToken),
        ).to.be.rejectedWith(BlError, /order could not be placed/);
      });
    });
  });
});
