import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";
import sinonChai from "sinon-chai";

import { CustomerItemPostHook } from "#services/legacy/collections/customer-item/hooks/customer-item-post.hook";
import { CustomerItemValidator } from "#services/legacy/collections/customer-item/validators/customer-item-validator";
import { BlStorage } from "#services/storage/bl-storage";
import { AccessToken } from "#shared/access-token";
import { BlError } from "#shared/bl-error";
import { CustomerItem } from "#shared/customer-item/customer-item";
import { Order } from "#shared/order/order";
import { UserDetail } from "#shared/user-detail";

chaiUse(chaiAsPromised);
should();
chaiUse(sinonChai);

test.group("CustomerItemPostHook", (group) => {
  let sandbox: sinon.SinonSandbox;
  let testCustomerItem: CustomerItem;
  let testOrder: Order;
  let testAccessToken: AccessToken;
  let validateCustomerItem: boolean;
  let testUserDetail: UserDetail;
  const customerItemValidator = new CustomerItemValidator();
  const customerItemPostHook = new CustomerItemPostHook(customerItemValidator);
  let orderUpdateStub: sinon.SinonStub;
  let userDetailStub: sinon.SinonStub;

  group.each.setup(() => {
    sandbox = createSandbox();
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
      emailConfirmed: true,
      dob: new Date(1755, 1, 11),
      active: true,
      customerItems: [],
      branchMembership: "branch1",
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

    sandbox.stub(BlStorage.Orders, "get").callsFake((id) => {
      if (id !== testOrder.id) {
        return Promise.reject(new BlError("order not found"));
      }
      return Promise.resolve(testOrder);
    });

    orderUpdateStub = sandbox.stub(BlStorage.Orders, "update").callsFake(() => {
      return Promise.resolve(testOrder);
    });

    sandbox.stub(customerItemValidator, "validate").callsFake(() => {
      if (!validateCustomerItem) {
        return Promise.reject("could not validate");
      }
      return Promise.resolve(true);
    });

    sandbox.stub(BlStorage.CustomerItems, "get").callsFake((id) => {
      if (id !== testCustomerItem.id) {
        return Promise.reject(new BlError("customerItem not found"));
      }
      return Promise.resolve(testCustomerItem);
    });

    sandbox.stub(BlStorage.UserDetails, "get").callsFake((id) => {
      if (id !== testUserDetail.id) {
        return Promise.reject(new BlError("userDetail not found"));
      }

      return Promise.resolve(testUserDetail);
    });

    userDetailStub = sandbox
      .stub(BlStorage.UserDetails, "update")
      .callsFake(() => {
        return Promise.resolve(testUserDetail);
      });
  });

  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if customerItem parameter is undefined", async () => {
    return expect(
      // @ts-expect-error fixme: auto ignored
      customerItemPostHook.before(undefined, testAccessToken),
    ).to.be.rejectedWith(BlError, /customerItem is undefined/);
  });

  test("should reject if customerItemValidator.validate rejects", async () => {
    validateCustomerItem = false;

    return expect(
      customerItemPostHook.before(testCustomerItem),
    ).to.be.rejectedWith(BlError, "could not validate customerItem");
  });

  test("should resolve with true if customerItemValidator.validate resolves", async () => {
    return expect(customerItemPostHook.before(testCustomerItem)).to.be
      .fulfilled;
  });

  test("should reject if userDetail is not valid", async () => {
    // @ts-expect-error fixme: auto ignored
    testUserDetail.name = null;

    // @ts-expect-error fixme: auto ignored
    testUserDetail.dob = null;

    return expect(
      customerItemPostHook.before(testCustomerItem),
    ).to.be.rejectedWith(BlError, /userDetail "userDetail1" not valid/);
  });

  test("should reject if customerItems are empty", async () => {
    return expect(
      customerItemPostHook.after([], testAccessToken),
    ).to.be.rejectedWith(BlError, /customerItems is empty or undefined/);
  });

  test("should reject if customerItem.customer is not defined", async () => {
    testCustomerItem.customer = "notFoundCustomer";

    return expect(
      customerItemPostHook.after([testCustomerItem], testAccessToken),
    ).to.be.rejectedWith(BlError, /userDetail not found/);
  });

  test("should update userDetail with the ids array if it was empty", async () => {
    testUserDetail.customerItems = [];
    customerItemPostHook.after([testCustomerItem], testAccessToken).then(() => {
      return expect(
        userDetailStub.calledWithMatch("userDetail1", {
          customerItems: ["customerItem1"],
        }),
      ).to.be.true;
    });
  });

  test("should add the new id to the old userDetail.customerItem array", async () => {
    testUserDetail.customerItems = ["customerItem2"];
    customerItemPostHook.after([testCustomerItem], testAccessToken).then(() => {
      // @ts-expect-error fixme: auto ignored bad test types
      userDetailStub.should.have.been.calledWith("userDetail1", {
        customerItems: ["customerItem2", "customerItem1"],
      });
    });
  });

  test("should reject with error if customerItems.orders.length is over 1", async () => {
    testCustomerItem.orders = ["order1", "order2"];

    return expect(
      customerItemPostHook.after([testCustomerItem], testAccessToken),
    ).to.be.rejectedWith(
      BlError,
      /customerItem.orders.length is "2" but should be "1"/,
    );
  });

  test("should update order.orderItems with the customerItem", async () => {
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

    customerItemPostHook.after([testCustomerItem], testAccessToken).then(() => {
      // @ts-expect-error fixme: auto ignored bad test types
      orderUpdateStub.should.have.been.calledWith("order1", {
        orderItems: expectedOrderUpdateParameter,
      });
    });
  });
});
