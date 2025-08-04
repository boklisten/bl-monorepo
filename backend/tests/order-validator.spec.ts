import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { OrderFieldValidator } from "#services/legacy/collections/order/helpers/order-validator/order-field-validator/order-field-validator";
import { OrderItemValidator } from "#services/legacy/collections/order/helpers/order-validator/order-item-validator/order-item-validator";
import { OrderPlacedValidator } from "#services/legacy/collections/order/helpers/order-validator/order-placed-validator/order-placed-validator";
import { OrderUserDetailValidator } from "#services/legacy/collections/order/helpers/order-validator/order-user-detail-validator/order-user-detail-validator";
import { OrderValidator } from "#services/legacy/collections/order/helpers/order-validator/order-validator";
import { StorageService } from "#services/storage_service";
import { BlError } from "#shared/bl-error";
import { Branch } from "#shared/branch";
import { Order } from "#shared/order/order";

chaiUse(chaiAsPromised);
should();

test.group("OrderValidator", (group) => {
  let testOrder: Order;
  let testBranch: Branch;

  const orderUserDetailValidator = new OrderUserDetailValidator();

  const orderItemValidator = new OrderItemValidator();
  const orderPlacedValidator = new OrderPlacedValidator();
  const orderFieldValidator = new OrderFieldValidator();
  const orderValidator: OrderValidator = new OrderValidator(
    orderItemValidator,
    orderPlacedValidator,
    orderFieldValidator,
    orderUserDetailValidator,
  );

  // @ts-expect-error fixme: auto ignored
  let orderItemShouldResolve;

  // @ts-expect-error fixme: auto ignored
  let orderPlacedShouldResolve;

  // @ts-expect-error fixme: auto ignored
  let orderUserDetailValidatorShouldResolve;
  let sandbox: sinon.SinonSandbox;
  group.each.setup(() => {
    sandbox = createSandbox();
    sandbox.stub(StorageService.Branches, "get").callsFake((id) => {
      if (id !== testBranch.id) {
        return Promise.reject(new BlError("not found").code(702));
      }

      return Promise.resolve(testBranch);
    });

    sandbox.stub(orderItemValidator, "validate").callsFake(() => {
      // @ts-expect-error fixme: auto ignored
      if (!orderItemShouldResolve) {
        return Promise.reject(new BlError("orderItems not valid"));
      }
      return Promise.resolve(true);
    });

    sandbox.stub(orderPlacedValidator, "validate").callsFake(() => {
      // @ts-expect-error fixme: auto ignored
      if (!orderPlacedShouldResolve) {
        return Promise.reject(new BlError("validation of order.placed failed"));
      }
      return Promise.resolve(true);
    });

    sandbox.stub(orderUserDetailValidator, "validate").callsFake(() => {
      // @ts-expect-error fixme: auto ignored
      if (!orderUserDetailValidatorShouldResolve) {
        return Promise.reject(new BlError("validation of UserDetail failed"));
      }

      return Promise.resolve(true);
    });

    orderItemShouldResolve = true;
    orderPlacedShouldResolve = true;
    orderUserDetailValidatorShouldResolve = true;

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
            date: new Date(),
            maxNumberOfPeriods: 2,
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
      },
    };
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if amount is null or undefined", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.amount = undefined;
    return expect(
      orderValidator.validate(testOrder, false),
    ).to.eventually.be.rejectedWith(BlError, /order.amount is undefined/);
  });

  test("should reject if branch is not found", async () => {
    testOrder.branch = "notFoundBranch";

    return expect(orderValidator.validate(testOrder, false)).to.be.rejectedWith(
      BlError,
      "not found",
    );
  });

  test("should reject if orderItems is empty or undefined", async () => {
    testOrder.orderItems = [];
    return expect(
      orderValidator.validate(testOrder, false),
    ).to.eventually.be.rejectedWith(
      BlError,
      /order.orderItems is empty or undefined/,
    );
  });

  test("should reject with error", async () => {
    orderItemShouldResolve = false;

    return expect(
      orderValidator.validate(testOrder, false),
    ).to.eventually.be.rejectedWith(BlError, /orderItems not valid/);
  });

  test("should reject with error", async () => {
    orderPlacedShouldResolve = false;

    return expect(
      orderValidator.validate(testOrder, false),
    ).to.eventually.be.rejectedWith(
      BlError,
      /validation of order.placed failed/,
    );
  });

  test("should reject with error", async () => {
    orderUserDetailValidatorShouldResolve = false;

    return expect(orderValidator.validate(testOrder, false)).to.be.rejectedWith(
      BlError,
      /validation of UserDetail failed/,
    );
  });
});
