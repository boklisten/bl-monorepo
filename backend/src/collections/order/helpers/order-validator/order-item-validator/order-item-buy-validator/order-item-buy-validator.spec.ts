import "mocha";
import { OrderItemBuyValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-buy-validator/order-item-buy-validator";
import { PriceService } from "@backend/price/price.service";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { Item } from "@shared/item/item";
import { Order } from "@shared/order/order";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("OrderItemBuyValidator", () => {
  const priceService = new PriceService();
  const orderItemPriceValidator = new OrderItemBuyValidator(priceService);

  let testOrder: Order;
  let testItem: Item;
  let testBranch: Branch;

  beforeEach(() => {
    testOrder = {
      id: "order1",
      amount: 600,
      customer: "",
      orderItems: [
        {
          item: "item1",
          title: "Spinn",
          amount: 600,
          unitPrice: 600,
          taxAmount: 0,
          taxRate: 0,
          type: "buy",
          info: {
            from: new Date(),
            to: new Date(),
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
            maxNumberOfPeriods: 2,
            date: new Date(),
            percentage: 0.5,
          },
        ],
        extendPeriods: [
          {
            type: "semester",
            price: 100,
            date: new Date(),
            maxNumberOfPeriods: 1,
          },
        ],
        buyout: {
          percentage: 0.5,
        },
        acceptedMethods: ["card"],
      },
    };

    testItem = {
      id: "item1",
      title: "Signatur 3",
      type: "book",
      price: 600,
      taxRate: 0,

      buyback: false,
      categories: [],
      digital: false,
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

  describe("validate()", () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      testOrder.orderItems[0].type = "buy";
    });

    it("should resolve when a valid order is passed", () => {
      return expect(
        orderItemPriceValidator.validate(
          testBranch,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testOrder.orderItems[0],
          testItem,
        ),
      ).to.eventually.be.fulfilled;
    });

    context("when discount is not set", () => {
      beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].discount = null;
      });

      it("should reject if the orderItem.taxRate is not the same as item.taxRate", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].taxRate = 0.75;
        testItem.taxRate = 0.33;

        return expect(
          orderItemPriceValidator.validate(
            testBranch,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testOrder.orderItems[0],
            testItem,
          ),
        ).to.be.rejectedWith(
          BlError,
          /orderItem.taxRate "0.75" is not equal to item.taxRate "0.33"/,
        );
      });

      it("should reject if the orderItem.taxAmount is not equal to (item.price * item.taxRate)", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].amount = 300;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].taxAmount = 100;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].taxRate = 0.5;
        testItem.price = 300;
        testItem.taxRate = 0.5;

        return expect(
          orderItemPriceValidator.validate(
            testBranch,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testOrder.orderItems[0],
            testItem,
          ),
        ).to.be.rejectedWith(
          BlError,
          /orderItem.taxAmount "100" is not equal to \(orderItem.amount "300" \* item.taxRate "0.5"\) "150"/,
        );
      });

      it("should reject when item.price is 200 and orderItem.amount is 100", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].amount = 100;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].taxAmount = 0;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].taxRate = 0;
        testItem.price = 200;
        testItem.taxRate = 0;

        return expect(
          orderItemPriceValidator.validate(
            testBranch,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testOrder.orderItems[0],
            testItem,
          ),
        ).to.be.rejectedWith(
          BlError,
          /orderItem.amount "100" is not equal to item.price "200" - orderItem.discount "0" = "200"/,
        );
      });

      it("should reject if item.price is 134 and orderItem.amount is 400", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].amount = 400;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].taxAmount = 0;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].taxRate = 0;
        testItem.price = 134;
        testItem.taxRate = 0;

        return expect(
          orderItemPriceValidator.validate(
            testBranch,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testOrder.orderItems[0],
            testItem,
          ),
        ).to.be.rejectedWith(
          BlError,
          /orderItem.amount "400" is not equal to item.price "134" - orderItem.discount "0" = "134"/,
        );
      });

      it("should resolve if a valid order is sent", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].type = "buy";
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].amount = 400;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].item = "theItem";
        testOrder.amount = 400;
        testItem.price = 400;
        testItem.id = "theItem";

        return expect(
          orderItemPriceValidator.validate(
            testBranch,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testOrder.orderItems[0],
            testItem,
          ),
        ).to.be.fulfilled;
      });
    });

    context("when discount is set", () => {
      beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].discount = {
          amount: 100,
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].taxAmount = 0;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].taxRate = 0;
        testItem.taxRate = 0;
      });

      it("should reject if orderItem.taxAmount is not equal to ((item.price - discount.amount) * item.taxRate)", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].amount = 400;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].taxRate = 0.5;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].taxAmount = 100;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].discount = {
          amount: 100,
        };
        testItem.taxRate = 0.5;
        testItem.price = 500;

        return expect(
          orderItemPriceValidator.validate(
            testBranch,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testOrder.orderItems[0],
            testItem,
          ),
        ).to.be.rejectedWith(
          BlError,
          /orderItem.taxAmount "100" is not equal to \(orderItem.amount "400" \* item.taxRate "0.5"\) "200"/,
        );
      });

      it("should reject if (item.price - discount.amount) is 400 but orderItem.amount is 100", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].amount = 100;
        testItem.price = 500;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].discount = {
          amount: 100,
        };

        return expect(
          orderItemPriceValidator.validate(
            testBranch,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testOrder.orderItems[0],
            testItem,
          ),
        ).to.be.rejectedWith(
          BlError,
          /orderItem.amount "100" is not equal to item.price "500" - orderItem.discount "100" = "400"/,
        );
      });

      it("should reject if (item.price - discount.amount) is 200 but orderItem.amount is 560", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].amount = 560;
        testItem.price = 500;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].discount = {
          amount: 300,
        };

        return expect(
          orderItemPriceValidator.validate(
            testBranch,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testOrder.orderItems[0],
            testItem,
          ),
        ).to.be.rejectedWith(
          BlError,
          /orderItem.amount "560" is not equal to item.price "500" - orderItem.discount "300" = "200"/,
        );
      });

      it("should resolve if a valid order is placed", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].amount = 300;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].item = "theItem1";
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.orderItems[0].discount = {
          amount: 300,
        };
        testOrder.amount = 300;
        testItem.id = "theItem1";
        testItem.price = 600;

        return expect(
          orderItemPriceValidator.validate(
            testBranch,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testOrder.orderItems[0],
            testItem,
          ),
        ).to.be.fulfilled;
      });
    });
  });
});
