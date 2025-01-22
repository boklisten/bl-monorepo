import { OrderFieldValidator } from "@backend/express/collections/order/helpers/order-validator/order-field-validator/order-field-validator.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Order } from "@shared/order/order.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("OrderFieldValidator", (group) => {
  let testOrder: Order;
  const orderItemFieldValidator = new OrderFieldValidator();

  group.each.setup(() => {
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

  test("should reject if order.orderItems is not defined", async () => {
    testOrder.orderItems = [];

    return expect(
      orderItemFieldValidator.validate(testOrder),
    ).to.eventually.be.rejectedWith(
      BlError,
      "order.orderItems is empty or undefined",
    );
  });

  test("should reject if orderItem.item is not defined", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].item = null;

    return expect(
      orderItemFieldValidator.validate(testOrder),
    ).to.eventually.rejectedWith(BlError, /orderItem.item is not defined/);
  });

  test("should reject if orderItem.title is not defined", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].title = undefined;

    return expect(
      orderItemFieldValidator.validate(testOrder),
    ).to.eventually.be.rejectedWith(BlError, /orderItem.title is not defined/);
  });

  test("should reject if orderItem.amount is not defined", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].amount = undefined;

    return expect(
      orderItemFieldValidator.validate(testOrder),
    ).to.eventually.be.rejectedWith(BlError, /orderItem.amount is not defined/);
  });

  test("should reject if orderItem.unitPrice is not defined", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].unitPrice = null;

    return expect(
      orderItemFieldValidator.validate(testOrder),
    ).to.eventually.be.rejectedWith(
      BlError,
      /orderItem.unitPrice is not defined/,
    );
  });

  test("should reject if orderItem.taxAmount is not defined", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].taxAmount = null;

    return expect(
      orderItemFieldValidator.validate(testOrder),
    ).to.eventually.be.rejectedWith(
      BlError,
      /orderItem.taxAmount is not defined/,
    );
  });

  test("should reject if orderItem.taxRate is not defined", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].taxRate = undefined;

    return expect(
      orderItemFieldValidator.validate(testOrder),
    ).to.eventually.be.rejectedWith(
      BlError,
      /orderItem.taxRate is not defined/,
    );
  });

  test("should reject if orderItem.type is not defined", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].type = null;

    return expect(
      orderItemFieldValidator.validate(testOrder),
    ).to.eventually.be.rejectedWith(BlError, /orderItem.type is not defined/);
  });
});
