import "mocha";

import { OrderFieldValidator } from "@backend/collections/order/helpers/order-validator/order-field-validator/order-field-validator";
import { OrderItemBuyValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-buy-validator/order-item-buy-validator";
import { OrderItemExtendValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-extend-validator/order-item-extend-validator";
import { OrderItemRentValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-rent-validator/order-item-rent-validator";
import { OrderItemValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-validator";
import { BlStorage } from "@backend/storage/bl-storage";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { Item } from "@shared/item/item";
import { Order } from "@shared/order/order";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();

describe("OrderItemValidator", () => {
  const orderItemFieldValidator = new OrderFieldValidator();
  const orderItemRentValidator = new OrderItemRentValidator();
  const orderItemBuyValidator = new OrderItemBuyValidator();
  const orderItemExtendValidator = new OrderItemExtendValidator();

  const orderItemValidator = new OrderItemValidator(
    orderItemFieldValidator,
    orderItemRentValidator,
    orderItemBuyValidator,
    orderItemExtendValidator,
  );

  let testOrder: Order;
  let testBranch: Branch;

  const legalDeadline = new Date();
  legalDeadline.setFullYear(legalDeadline.getFullYear() + 1);
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    testOrder = {
      id: "order1",
      amount: 300,
      customer: "",
      orderItems: [
        {
          item: "item2",
          title: "Spinn",
          amount: 300,
          unitPrice: 600,
          taxAmount: 0,
          taxRate: 0,
          type: "rent",
          info: {
            from: new Date(),
            to: legalDeadline,
            numberOfPeriods: 1,
            periodType: "semester",
          },
        },
      ],
      delivery: "delivery1",
      branch: "branch1",
      byCustomer: true,
      payments: ["payment1"],
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
            date: new Date(),
            maxNumberOfPeriods: 0,
            percentage: 0.5,
          },
        ],
        extendPeriods: [
          {
            type: "semester",
            date: new Date(),
            maxNumberOfPeriods: 1,
            price: 100,
          },
        ],
        buyout: {
          percentage: 0.5,
        },
      },
    };

    sandbox = createSandbox();
    sandbox.stub(orderItemRentValidator, "validate").callsFake(() => {
      return Promise.resolve(true);
    });

    sandbox.stub(orderItemBuyValidator, "validate").callsFake(() => {
      return Promise.resolve(true);
    });

    sandbox.stub(orderItemExtendValidator, "validate").callsFake(() => {
      return Promise.resolve(true);
    });

    sandbox.stub(BlStorage.Branches, "get").callsFake((id) => {
      if (id !== "branch1") {
        return Promise.reject(new BlError("not found").code(702));
      }
      return Promise.resolve(testBranch);
    });

    sandbox.stub(BlStorage.Items, "get").callsFake((id) => {
      return Promise.resolve({} as Item);
    });
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("#validate()", () => {
    context(
      "when order.amount is not equal to the total of orderItems amount",
      () => {
        it("should reject with error whe the order.branch is not found", () => {
          testOrder.branch = "notFoundBranch";
        });

        it("should reject with error when order.amount is 500 and total of orderItems is 250", () => {
          testOrder.amount = 500;

          // @ts-expect-error fixme: auto ignored
          testOrder.orderItems[0].amount = 250;

          return expect(
            orderItemValidator.validate(testBranch, testOrder, false),
          ).to.be.rejectedWith(
            BlError,
            /order.amount is "500" but total of orderItems amount is "250"/,
          );
        });

        it("should reject with error when order.amount is 100 and total of orderItems is 780", () => {
          testOrder.amount = 100;

          // @ts-expect-error fixme: auto ignored
          testOrder.orderItems[0].amount = 780;

          return expect(
            orderItemValidator.validate(testBranch, testOrder, false),
          ).to.be.rejectedWith(
            BlError,
            /order.amount is "100" but total of orderItems amount is "780"/,
          );
        });
      },
    );

    it("should reject if amount does not include taxAmount", () => {
      testOrder.orderItems = [
        {
          type: "rent",
          item: "item1",
          title: "signatur 3",
          amount: 100, // this should have been (unitPrice + taxAmount)
          unitPrice: 100,
          taxRate: 0.25,
          taxAmount: 25, // this should be (unitPrice * taxRate)
          info: {
            to: legalDeadline,
          },
        },
      ];

      testOrder.amount = 100;

      return expect(
        orderItemValidator.validate(testBranch, testOrder, false),
      ).to.be.rejectedWith(
        BlError,
        /orderItem.amount "100" is not equal to orderItem.unitPrice "100" \+ orderItem.taxAmount "25"/,
      );
    });

    it("should reject if amount does not includes more than unitPrice + taxAmount", () => {
      testOrder.orderItems = [
        {
          type: "rent",
          item: "item1",
          title: "signatur 3",
          amount: 160, // this should have been (unitPrice + taxAmount)
          unitPrice: 100,
          taxRate: 0.25,
          taxAmount: 25, // this should be (unitPrice * taxRate)
          info: {
            to: legalDeadline,
          },
        },
      ];

      testOrder.amount = 160;

      return expect(
        orderItemValidator.validate(testBranch, testOrder, false),
      ).to.be.rejectedWith(
        BlError,
        /orderItem.amount "160" is not equal to orderItem.unitPrice "100" \+ orderItem.taxAmount "25"/,
      );
    });

    it("should reject if taxAmount does not equal unitPrice * taxRate", () => {
      testOrder.orderItems = [
        {
          type: "rent",
          item: "item1",
          title: "signatur 3",
          amount: 100, // this should have been (unitPrice + taxAmount)
          unitPrice: 100,
          taxRate: 0.25,
          taxAmount: 0, // this should be (unitPrice * taxRate)
          info: {
            to: legalDeadline,
          },
        },
      ];

      testOrder.amount = 100;

      return expect(
        orderItemValidator.validate(testBranch, testOrder, false),
      ).to.be.rejectedWith(
        BlError,
        /orderItem.taxAmount "0" is not equal to orderItem.unitPrice "100" \* orderItem.taxRate "0.25"/,
      );
    });

    it("should resolve if price amount is valid", () => {
      testOrder.orderItems = [
        {
          type: "rent",
          item: "item1",
          title: "signatur 3",
          amount: 125,
          unitPrice: 100,
          taxRate: 0.25,
          taxAmount: 25,
          info: {
            to: legalDeadline,
          },
        },
      ];

      testOrder.amount = 125;

      return expect(orderItemValidator.validate(testBranch, testOrder, false))
        .to.be.fulfilled;
    });

    it("should reject if deadline is in the past and user is not admin", () => {
      testOrder.orderItems = [
        {
          type: "rent",
          item: "item1",
          title: "signatur 3",
          amount: 125,
          unitPrice: 100,
          taxRate: 0.25,
          taxAmount: 25,
          info: {
            to: new Date(1234567891011), // Friday, February 13th 2009
          },
        },
      ];
      testOrder.amount = 125;
      return expect(
        orderItemValidator.validate(testBranch, testOrder, false),
      ).to.eventually.be.rejectedWith(
        BlError,
        /orderItem deadlines must be in the future/,
      );
    });

    it("should reject if deadline is more than four years into the future and user is not admin", () => {
      const deadline = new Date();
      deadline.setFullYear(deadline.getFullYear() + 4);
      deadline.setDate(deadline.getDate() + 1);
      testOrder.orderItems = [
        {
          type: "rent",
          item: "item1",
          title: "signatur 3",
          amount: 125,
          unitPrice: 100,
          taxRate: 0.25,
          taxAmount: 25,
          info: {
            to: deadline,
          },
        },
      ];
      testOrder.amount = 125;
      return expect(
        orderItemValidator.validate(testBranch, testOrder, false),
      ).to.eventually.be.rejectedWith(
        BlError,
        /orderItem deadlines must less than two years into the future/,
      );
    });

    it("should fulfill if deadline is in the past and user is admin", () => {
      testOrder.orderItems = [
        {
          type: "rent",
          item: "item1",
          title: "signatur 3",
          amount: 125,
          unitPrice: 100,
          taxRate: 0.25,
          taxAmount: 25,
          info: {
            to: new Date(1234567891011), // Friday, February 13th 2009
          },
        },
      ];
      testOrder.amount = 125;
      return expect(orderItemValidator.validate(testBranch, testOrder, true)).to
        .eventually.be.fulfilled;
    });

    it("should fulfill if deadline is more than four years into the future and user is admin", () => {
      const deadline = new Date();
      deadline.setFullYear(deadline.getFullYear() + 4);
      deadline.setDate(deadline.getDate() + 1);
      testOrder.orderItems = [
        {
          type: "rent",
          item: "item1",
          title: "signatur 3",
          amount: 125,
          unitPrice: 100,
          taxRate: 0.25,
          taxAmount: 25,
          info: {
            to: deadline,
          },
        },
      ];
      testOrder.amount = 125;
      return expect(orderItemValidator.validate(testBranch, testOrder, true)).to
        .eventually.be.fulfilled;
    });
  });
});
