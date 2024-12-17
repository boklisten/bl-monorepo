import "mocha";
import { BlError, Order } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { OrderFieldValidator } from "@/collections/order/helpers/order-validator/order-field-validator/order-field-validator";

chai.use(chaiAsPromised);

describe("OrderFieldValidator", () => {
  let testOrder: Order;
  const orderItemFieldValidator = new OrderFieldValidator();

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
  });

  describe("validate()", () => {
    context("when required fields of order is empty or undefined", () => {
      it("should reject if order.orderItems is not defined", () => {
        testOrder.orderItems = [];

        return expect(
          orderItemFieldValidator.validate(testOrder),
        ).to.eventually.be.rejectedWith(
          BlError,
          "order.orderItems is empty or undefined",
        );
      });
    });

    context(
      "when required fields of a orderItem is empty or not defined",
      () => {
        it("should reject if orderItem.item is not defined", () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testOrder.orderItems[0].item = null;

          return expect(
            orderItemFieldValidator.validate(testOrder),
          ).to.eventually.rejectedWith(
            BlError,
            /orderItem.item is not defined/,
          );
        });

        it("should reject if orderItem.title is not defined", () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testOrder.orderItems[0].title = undefined;

          return expect(
            orderItemFieldValidator.validate(testOrder),
          ).to.eventually.be.rejectedWith(
            BlError,
            /orderItem.title is not defined/,
          );
        });

        it("should reject if orderItem.amount is not defined", () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testOrder.orderItems[0].amount = undefined;

          return expect(
            orderItemFieldValidator.validate(testOrder),
          ).to.eventually.be.rejectedWith(
            BlError,
            /orderItem.amount is not defined/,
          );
        });

        it("should reject if orderItem.unitPrice is not defined", () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testOrder.orderItems[0].unitPrice = null;

          return expect(
            orderItemFieldValidator.validate(testOrder),
          ).to.eventually.be.rejectedWith(
            BlError,
            /orderItem.unitPrice is not defined/,
          );
        });

        it("should reject if orderItem.taxAmount is not defined", () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testOrder.orderItems[0].taxAmount = null;

          return expect(
            orderItemFieldValidator.validate(testOrder),
          ).to.eventually.be.rejectedWith(
            BlError,
            /orderItem.taxAmount is not defined/,
          );
        });

        it("should reject if orderItem.taxRate is not defined", () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testOrder.orderItems[0].taxRate = undefined;

          return expect(
            orderItemFieldValidator.validate(testOrder),
          ).to.eventually.be.rejectedWith(
            BlError,
            /orderItem.taxRate is not defined/,
          );
        });

        it("should reject if orderItem.type is not defined", () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testOrder.orderItems[0].type = null;

          return expect(
            orderItemFieldValidator.validate(testOrder),
          ).to.eventually.be.rejectedWith(
            BlError,
            /orderItem.type is not defined/,
          );
        });
      },
    );
  });
});
