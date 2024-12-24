import "mocha";

import { BlCollectionName } from "@backend/collections/bl-collection";
import { OrderValidator } from "@backend/collections/order/helpers/order-validator/order-validator";
import { OrderHookBefore } from "@backend/collections/order/hooks/order-hook-before";
import { OrderPostHook } from "@backend/collections/order/hooks/order.post.hook";
import { orderSchema } from "@backend/collections/order/order.schema";
import { UserDetailHelper } from "@backend/collections/user-detail/helpers/user-detail.helper";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("OrderPostHook", () => {
  const orderValidator: OrderValidator = new OrderValidator();
  const orderStorage = new BlDocumentStorage<Order>(
    BlCollectionName.Orders,
    orderSchema,
  );
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
    userDetailSchema,
  );
  const userDetailHelper = new UserDetailHelper(userDetailStorage);
  const orderHookBefore: OrderHookBefore = new OrderHookBefore();
  const orderPostHook: OrderPostHook = new OrderPostHook(
    orderValidator,
    orderHookBefore,
    userDetailStorage,
    userDetailHelper,
  );

  let testOrder: Order;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let testUserDetails: UserDetail;
  let testAccessToken: AccessToken;
  let orderValidated: boolean;

  beforeEach(() => {
    testAccessToken = {
      iss: "boklisten.co",
      aud: "boklisten.co",
      iat: 123,
      exp: 123,
      sub: "user1",
      username: "b@a.com",
      permission: "customer",
      details: "user1",
    };

    orderValidated = true;

    testUserDetails = {
      id: "user1",
      name: "Olly Molly",
      email: "a@b.com",
      phone: "",
      address: "",
      postCode: "",
      postCity: "",
      country: "",
      dob: new Date(),
      branch: "branch1",
      orders: [],
      signatures: [],
    };

    testOrder = {
      id: "order1",
      customer: "customer1",
      amount: 400,
      orderItems: [
        {
          type: "buy",
          amount: 300,
          item: "i1",
          title: "signatur",
          taxRate: 0,
          taxAmount: 0,
          unitPrice: 300,
        },
        {
          type: "rent",
          amount: 100,
          item: "i1",
          title: "signatur",
          taxRate: 0,
          taxAmount: 0,
          unitPrice: 300,
        },
      ],
      branch: "b1",
      byCustomer: true,
      payments: [],
      delivery: "",
      comments: [],
      active: false,
      user: {
        id: "u1",
      },
      lastUpdated: new Date(),
      creationTime: new Date(),
      pendingSignature: false,
    };
  });

  sinon.stub(orderValidator, "validate").callsFake(async () => {
    if (orderValidated) {
      return true;
    }
    throw new BlError("not a valid order");
  });

  sinon.stub(orderStorage, "get").callsFake((orderId: string) => {
    if (orderId !== "order1" && orderId !== "orderValid") {
      return Promise.reject(new BlError("not found").code(702));
    }
    return Promise.resolve(testOrder);
  });

  describe("#before()", () => {
    sinon.stub(orderHookBefore, "validate").callsFake((requestBody: any) => {
      return new Promise((resolve, reject) => {
        if (!requestBody["valid"]) {
          return reject(new BlError("not a valid order").code(701));
        }
        resolve(true);
      });
    });

    it("should reject if requestBody is not valid", () => {
      return expect(
        orderPostHook.before({ valid: false }, testAccessToken),
      ).to.eventually.be.rejectedWith(BlError, /not a valid order/);
    });

    it("should resolve if requestBody is valid", () => {
      return expect(orderHookBefore.validate({ valid: true })).to.eventually.be
        .fulfilled;
    });
  });
  describe("#after()", () => {
    it("should reject if accessToken is empty or undefined", (done) => {
      orderPostHook.after([testOrder]).catch((blError: BlError) => {
        expect(blError.getMsg()).to.contain(
          "accessToken was not specified when trying to process order",
        );
        done();
      });
    });

    context("when orderValidator rejects", () => {
      it("should reject if orderValidator.validate rejected with error", () => {
        orderValidated = false;

        testOrder.id = "order1";
        return expect(
          orderPostHook.after([testOrder], testAccessToken),
        ).to.eventually.be.rejectedWith(BlError, /not a valid order/);
      });
    });

    context("when orderValidator resolves", () => {
      it("should resolve with testOrder when orderValidator.validate is resolved", (done) => {
        orderValidated = true;
        testOrder.id = "order1";

        orderPostHook
          .after([testOrder], testAccessToken)
          .then((orders: Order[]) => {
            expect(orders.length).to.be.eql(1);
            expect(orders[0]).to.eql(testOrder);
            done();
          });
      });
    });

    it("should reject if order.placed is set to true", () => {
      testOrder.placed = true;

      return expect(
        orderPostHook.after([testOrder], testAccessToken),
      ).to.be.rejectedWith(
        BlError,
        /order.placed is set to true on post of order/,
      );
    });
  });
});
