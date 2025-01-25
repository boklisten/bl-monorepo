import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import { OrderHookBefore } from "#services/collections/order/hooks/order-hook-before";

chaiUse(chaiAsPromised);
should();

test.group("OrderHookBefore", async () => {
  const orderHookBefore: OrderHookBefore = new OrderHookBefore();

  test("should reject if body is an array", async () => {
    // @ts-expect-error fixme: auto ignored
    const testRequest = [];

    // @ts-expect-error fixme: auto ignored
    orderHookBefore.validate(testRequest).catch((blError: BlError) => {
      return expect(blError.getMsg()).to.contain(
        "request is an array but should be a object",
      );
    });
  });

  test("should reject if body does not include the minimum required fields of order like amount and orderItems", async () => {
    const testRequest = {
      somethingRandom: ["hi", "hello there"],
    };

    orderHookBefore.validate(testRequest).catch((blError: BlError) => {
      expect(blError.getMsg()).to.contain("the request body is not valid");
      return expect(blError.getCode()).to.be.eql(701);
    });
  });

  test("should resolve if the request have the minimum required fields of Order", async () => {
    const testRequest = {
      id: "order1",
      amount: 450,
      orderItems: [
        {
          type: "buy",
          amount: 300,
          item: "i1",
          title: "signatur",
          rentRate: 0,
          taxRate: 0,
          taxAmount: 0,
          unitPrice: 300,
        },
        {
          type: "rent",
          amount: 150,
          item: "i2",
          customerItem: "ci2",
          title: "signatur",
          rentRate: 0,
          taxRate: 0,
          taxAmount: 0,
          unitPrice: 300,
          rentInfo: {
            oneSemester: true,
            twoSemesters: false,
          },
        },
      ],
      delivery: "delivery1",
      branch: "b1",
      byCustomer: true,
      payments: ["payment1"],
      active: false,
      user: {
        id: "u1",
      },
      lastUpdated: new Date(),
      creationTime: new Date(),
    };

    orderHookBefore.validate(testRequest).then((valid) => {
      return expect(valid).to.be.true;
    });
  });
});
