import { OrderItemExtendValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-extend-validator/order-item-extend-validator.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Branch } from "@shared/branch/branch.js";
import { CustomerItem } from "@shared/customer-item/customer-item.js";
import { Order } from "@shared/order/order.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("OrderItemExtendValidator", () => {
  const orderItemExtendValidator = new OrderItemExtendValidator();

  let testOrder: Order;

  // @ts-expect-error fixme: auto ignored
  let testItem: Item;
  let testBranch: Branch;
  let testCustomerItem: CustomerItem;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = createSandbox();
    sandbox.stub(BlStorage.CustomerItems, "get").callsFake((id) => {
      if (id !== testCustomerItem.id) {
        return Promise.reject(new BlError("not found").code(702));
      }
      return Promise.resolve(testCustomerItem);
    });
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("validate()", () => {
    it('should reject if orderItem.type is not "extend"', () => {
      // @ts-expect-error fixme: auto ignored
      testOrder.orderItems[0].type = "rent";
      return expect(
        // @ts-expect-error fixme: auto ignored
        orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
      ).to.be.rejectedWith(BlError, /orderItem.type "rent" is not "extend"/);
    });

    it("should reject if orderItem.info.periodType is not allowed at branch", () => {
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

    it("should reject if orderItem.info.numberOfPeriods is greater than the maxNumberOfPeriods on branch", () => {
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

    it("should reject if orderItem.info is not defined", () => {
      // @ts-expect-error fixme: auto ignored
      testOrder.orderItems[0].info = null;

      return expect(
        // @ts-expect-error fixme: auto ignored
        orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
      ).to.be.rejectedWith(BlError, /orderItem.info is not defined/);
    });

    it("should reject if orderItem.customerItem is not defined", () => {
      // @ts-expect-error fixme: auto ignored
      testOrder.orderItems[0].info.customerItem = null;

      return expect(
        // @ts-expect-error fixme: auto ignored
        orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
      ).to.be.rejectedWith(
        BlError,
        /orderItem.info.customerItem is not defined/,
      );
    });

    it("should reject when customerItem have been extended to many times", () => {
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

  beforeEach(() => {
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

    testItem = {
      id: "item1",
      title: "Signatur 3",
      price: 600,
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
  });
});
