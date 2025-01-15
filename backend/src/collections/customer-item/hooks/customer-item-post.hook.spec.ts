import "mocha";

import { CustomerItemModel } from "@backend/collections/customer-item/customer-item.model";
import { CustomerItemPostHook } from "@backend/collections/customer-item/hooks/customer-item-post.hook";
import { CustomerItemValidator } from "@backend/collections/customer-item/validators/customer-item-validator";
import { OrderModel } from "@backend/collections/order/order.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Order } from "@shared/order/order";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chaiUse(chaiAsPromised);
should();
chaiUse(sinonChai);

describe("CustomerItemPostHook", () => {
  let testCustomerItem: CustomerItem;
  let testOrder: Order;
  let testAccessToken: AccessToken;
  let validateCustomerItem: boolean;
  let testUserDetail: UserDetail;
  const customerItemStorage = new BlStorage(CustomerItemModel);
  const userDetailStorage = new BlStorage(UserDetailModel);
  const orderStorage = new BlStorage(OrderModel);
  const customerItemValidator = new CustomerItemValidator();
  const customerItemPostHook = new CustomerItemPostHook(
    customerItemValidator,
    userDetailStorage,
    orderStorage,
  );

  beforeEach(() => {
    testAccessToken = {
      sub: "user1",
      permission: "customer",
      details: "userDetail1",
    } as AccessToken;

    // @ts-expect-error fixme: auto ignored
    testUserDetail = {
      id: "userDetail1",
      name: "Alexander Hamilton",
      address: "Boston road 1c",
      postCode: "1234",
      postCity: "Boston",
      phone: "21212121",
      country: "USA",
      emailConfirmed: true,
      dob: new Date(1755, 1, 11),
      active: true,
      customerItems: [],
    } as UserDetail;

    testCustomerItem = {
      id: "customerItem1",
      customer: "userDetail1",
      item: "item1",
      deadline: new Date(),
      handout: true,
      handoutInfo: {
        handoutBy: "branch",
        handoutById: "branch1",
        handoutEmployee: "employee1",
        time: new Date(),
      },
      returned: false,
      orders: ["order1"],
    };

    testOrder = {
      id: "order1",
      amount: 100,
      orderItems: [
        {
          type: "rent",
          item: "item1",
          title: "Signatur 1",
          amount: 100,
          unitPrice: 400,
          taxRate: 0,
          taxAmount: 0,
          info: {
            from: new Date(),
            to: new Date(),
            numberOfPeriods: 1,
            periodType: "semester",
          },
        },
      ],
      branch: "branch1",
      customer: "customer1",
      byCustomer: false,
      employee: "employee1",
      placed: true,
      payments: [],
      pendingSignature: false,
    };

    validateCustomerItem = true;
  });

  sinon.stub(orderStorage, "get").callsFake((id: string) => {
    if (id !== testOrder.id) {
      return Promise.reject(new BlError("order not found"));
    }
    return Promise.resolve(testOrder);
  });

  const orderUpdateStub = sinon
    .stub(orderStorage, "update")
    .callsFake((id: string, data: any) => {
      return Promise.resolve(testOrder);
    });

  sinon
    .stub(customerItemValidator, "validate")
    .callsFake((customerItem: CustomerItem) => {
      if (!validateCustomerItem) {
        return Promise.reject("could not validate");
      }
      return Promise.resolve(true);
    });

  sinon.stub(userDetailStorage, "get").callsFake((id: string) => {
    if (id !== testUserDetail.id) {
      return Promise.reject(new BlError("userDetail not found"));
    }

    return Promise.resolve(testUserDetail);
  });

  sinon.stub(customerItemStorage, "get").callsFake((id: string) => {
    if (id !== testCustomerItem.id) {
      return Promise.reject(new BlError("customerItem not found"));
    }
    return Promise.resolve(testCustomerItem);
  });

  const userDetailStub = sinon
    .stub(userDetailStorage, "update")
    .callsFake((id: string, data: any) => {
      return Promise.resolve(testUserDetail);
    });

  describe("before()", () => {
    it("should reject if customerItem parameter is undefined", () => {
      return expect(
        // @ts-expect-error fixme: auto ignored
        customerItemPostHook.before(undefined, testAccessToken),
      ).to.be.rejectedWith(BlError, /customerItem is undefined/);
    });

    it("should reject if customerItemValidator.validate rejects", () => {
      validateCustomerItem = false;

      return expect(
        customerItemPostHook.before(testCustomerItem),
      ).to.be.rejectedWith(BlError, "could not validate customerItem");
    });

    it("should resolve with true if customerItemValidator.validate resolves", () => {
      return expect(customerItemPostHook.before(testCustomerItem)).to.be
        .fulfilled;
    });

    it("should reject if userDetail is not valid", () => {
      // @ts-expect-error fixme: auto ignored
      testUserDetail.name = null;

      // @ts-expect-error fixme: auto ignored
      testUserDetail.dob = null;

      return expect(
        customerItemPostHook.before(testCustomerItem),
      ).to.be.rejectedWith(BlError, /userDetail "userDetail1" not valid/);
    });
  });

  describe("after()", () => {
    it("should reject if customerItems are empty", () => {
      return expect(
        customerItemPostHook.after([], testAccessToken),
      ).to.be.rejectedWith(BlError, /customerItems is empty or undefined/);
    });

    it("should reject if customerItem.customer is not defined", () => {
      testCustomerItem.customer = "notFoundCustomer";

      return expect(
        customerItemPostHook.after([testCustomerItem], testAccessToken),
      ).to.be.rejectedWith(BlError, /userDetail not found/);
    });

    it("should update userDetail with the ids array if it was empty", (done) => {
      testUserDetail.customerItems = [];
      const ids = ["customerItem1"];

      customerItemPostHook
        .after([testCustomerItem], testAccessToken)
        .then(() => {
          expect(
            userDetailStub.calledWithMatch("userDetail1", {
              customerItems: ["customerItem1"],
            }),
          ).to.be.true;
          done();
        });
    });

    it("should add the new id to the old userDetail.customerItem array", (done) => {
      testUserDetail.customerItems = ["customerItem2"];
      const ids = ["customerItem1"];

      customerItemPostHook
        .after([testCustomerItem], testAccessToken)
        .then(() => {
          userDetailStub.should.have.been.calledWith("userDetail1", {
            customerItems: ["customerItem2", "customerItem1"],
          });
          done();
        });
    });

    it("should reject with error if customerItems.orders.length is over 1", () => {
      testCustomerItem.orders = ["order1", "order2"];

      expect(
        customerItemPostHook.after([testCustomerItem], testAccessToken),
      ).to.be.rejectedWith(
        BlError,
        /customerItem.orders.length is "2" but should be "1"/,
      );
    });

    it("should update order.orderItems with the customerItem", (done) => {
      testOrder.orderItems = [
        {
          type: "rent",
          item: "item1",
          title: "Signatur 1",
          amount: 100,
          unitPrice: 400,
          taxRate: 0,
          taxAmount: 0,
          info: {
            from: new Date(),
            to: new Date(),
            numberOfPeriods: 1,
            periodType: "semester",
          },
        },
      ];

      const expectedOrderUpdateParameter = [
        {
          type: "rent",
          item: "item1",
          title: "Signatur 1",
          amount: 100,
          unitPrice: 400,
          taxRate: 0,
          taxAmount: 0,
          info: {
            from: new Date(),
            to: new Date(),
            numberOfPeriods: 1,
            periodType: "semester",
            customerItem: "customerItem1", // expect to have this set
          },
        },
      ];

      customerItemPostHook
        .after([testCustomerItem], testAccessToken)
        .then(() => {
          orderUpdateStub.should.have.been.calledWith("order1", {
            orderItems: expectedOrderUpdateParameter,
          });
          done();
        });
    });
  });
});
