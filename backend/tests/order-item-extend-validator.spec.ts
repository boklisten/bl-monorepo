import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { OrderItemExtendValidator } from "#services/collections/order/helpers/order-validator/order-item-validator/order-item-extend-validator/order-item-extend-validator";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { Branch } from "#shared/branch/branch";
import { CustomerItem } from "#shared/customer-item/customer-item";
import { Order } from "#shared/order/order";

chaiUse(chaiAsPromised);
should();

test.group("OrderItemExtendValidator", (group) => {
  const orderItemExtendValidator = new OrderItemExtendValidator();

  let testOrder: Order;

  let testBranch: Branch;
  let testCustomerItem: CustomerItem;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    sandbox.stub(BlStorage.CustomerItems, "get").callsFake((id) => {
      if (id !== testCustomerItem.id) {
        return Promise.reject(new BlError("not found").code(702));
      }
      return Promise.resolve(testCustomerItem);
    });

    testCustomerItem = {
      id: "customerItem1",
      item: "item1",
      deadline: new Date(),
      handout: true,
      customer: "customer1",
      handoutInfo: {
        handoutBy: "branch",
        handoutById: "branch1",
        handoutEmployee: "employee1",
        time: new Date(),
      },
      returned: false,
      periodExtends: [
        {
          from: new Date(),
          to: new Date(),
          periodType: "year",
          time: new Date(),
        },
      ],
    };

    testOrder = {
      id: "order1",
      amount: 100,
      customer: "",
      orderItems: [
        {
          item: "item1",
          title: "Spinn",
          amount: 100,
          unitPrice: 100,
          taxAmount: 0,
          taxRate: 0,
          type: "extend",
          info: {
            from: new Date(),
            to: new Date(),
            numberOfPeriods: 1,
            periodType: "semester",
            customerItem: "customerItem1",
          },
        },
      ],
      delivery: "delivery1",
      branch: "branch1",
      byCustomer: true,
      pendingSignature: false,
    };

    testBranch = {
      id: "branch1",
      type: "privatist",
      name: "Sonans",
      branchItems: [],
      paymentInfo: {
        responsible: false,
        rentPeriods: [
          {
            type: "semester",
            maxNumberOfPeriods: 2,
            date: new Date(),
            percentage: 0.5,
          },
        ],
        extendPeriods: [
          {
            type: "semester",
            maxNumberOfPeriods: 1,
            date: new Date(),
            price: 100,
          },
        ],
        buyout: {
          percentage: 0.5,
        },
      },
    };
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test('should reject if orderItem.type is not "extend"', async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].type = "rent";
    return expect(
      // @ts-expect-error fixme: auto ignored
      orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
    ).to.be.rejectedWith(BlError, /orderItem.type "rent" is not "extend"/);
  });

  test("should reject if orderItem.info.periodType is not allowed at branch", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].info["periodType"] = "year";

    // @ts-expect-error fixme: auto ignored
    testBranch.paymentInfo.extendPeriods = [
      {
        type: "semester",
        price: 100,
        date: new Date(),
        maxNumberOfPeriods: 1,
      },
    ];

    return expect(
      // @ts-expect-error fixme: auto ignored
      orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
    ).to.be.rejectedWith(
      BlError,
      /orderItem.info.periodType is "year" but it is not allowed by branch/,
    );
  });

  test("should reject if orderItem.info.numberOfPeriods is greater than the maxNumberOfPeriods on branch", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].info["numberOfPeriods"] = 3;

    // @ts-expect-error fixme: auto ignored
    testBranch.paymentInfo.extendPeriods = [
      {
        type: "semester",
        price: 100,
        date: new Date(),
        maxNumberOfPeriods: 1,
      },
    ];
  });

  test("should reject if orderItem.info is not defined", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].info = null;

    return expect(
      // @ts-expect-error fixme: auto ignored
      orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
    ).to.be.rejectedWith(BlError, /orderItem.info is not defined/);
  });

  test("should reject if orderItem.customerItem is not defined", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].info.customerItem = null;

    return expect(
      // @ts-expect-error fixme: auto ignored
      orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
    ).to.be.rejectedWith(BlError, /orderItem.info.customerItem is not defined/);
  });

  test("should reject when customerItem have been extended to many times", async () => {
    testCustomerItem.id = "maxExtendedCustomerItem";

    // @ts-expect-error fixme: auto ignored
    testBranch.paymentInfo.extendPeriods = [
      {
        type: "semester",
        price: 100,
        date: new Date(),
        maxNumberOfPeriods: 1,
      },
    ];

    testCustomerItem.periodExtends = [
      {
        from: new Date(),
        to: new Date(),
        periodType: "semester",
        time: new Date(),
      },
      {
        from: new Date(),
        to: new Date(),
        periodType: "semester",
        time: new Date(),
      },
    ];
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].info.customerItem = "maxExtendedCustomerItem";

    return expect(
      // @ts-expect-error fixme: auto ignored
      orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
    ).to.be.rejectedWith(
      BlError,
      /orderItem can not be extended any more times/,
    );
  });
});
