import "mocha";

import { BlCollectionName } from "@backend/collections/bl-collection";
import { BranchValidator } from "@backend/collections/order/helpers/order-validator/branch-validator/branch-validator";
import { OrderFieldValidator } from "@backend/collections/order/helpers/order-validator/order-field-validator/order-field-validator";
import { OrderItemValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-validator";
import { OrderPlacedValidator } from "@backend/collections/order/helpers/order-validator/order-placed-validator/order-placed-validator";
import { OrderUserDetailValidator } from "@backend/collections/order/helpers/order-validator/order-user-detail-validator/order-user-detail-validator";
import { OrderValidator } from "@backend/collections/order/helpers/order-validator/order-validator";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { Order } from "@shared/order/order";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chai.use(chaiAsPromised);

describe("OrderValidator", () => {
  let testOrder: Order;
  let testBranch: Branch;

  const branchStorage = new BlDocumentStorage<Branch>(
    BlCollectionName.Branches,
  );
  const orderUserDetailValidator = new OrderUserDetailValidator();

  const branchValidator = new BranchValidator();
  const orderItemValidator = new OrderItemValidator();
  const orderPlacedValidator = new OrderPlacedValidator();
  const orderFieldValidator = new OrderFieldValidator();
  const orderValidator: OrderValidator = new OrderValidator(
    orderItemValidator,
    orderPlacedValidator,
    branchValidator,
    branchStorage,
    orderFieldValidator,
    orderUserDetailValidator,
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let orderItemShouldResolve;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let orderPlacedShouldResolve;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let branchValidatorShouldResolve;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let orderUserDetailValidatorShouldResolve;

  sinon.stub(branchStorage, "get").callsFake((id: string) => {
    if (id !== testBranch.id) {
      return Promise.reject(new BlError("not found").code(702));
    }

    return Promise.resolve(testBranch);
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sinon.stub(orderItemValidator, "validate").callsFake((order) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!orderItemShouldResolve) {
      return Promise.reject(new BlError("orderItems not valid"));
    }
    return Promise.resolve(true);
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sinon.stub(orderPlacedValidator, "validate").callsFake((order: Order) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!orderPlacedShouldResolve) {
      return Promise.reject(new BlError("validation of order.placed failed"));
    }
    return Promise.resolve(true);
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sinon.stub(branchValidator, "validate").callsFake((order: Order) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!branchValidatorShouldResolve) {
      return Promise.reject(new BlError("validation of branch failed"));
    }
    return Promise.resolve(true);
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sinon.stub(orderUserDetailValidator, "validate").callsFake((order: Order) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!orderUserDetailValidatorShouldResolve) {
      return Promise.reject(new BlError("validation of UserDetail failed"));
    }

    return Promise.resolve(true);
  });

  describe("#validate()", () => {
    it("should reject if amount is null or undefined", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      testOrder.amount = undefined;
      return expect(
        orderValidator.validate(testOrder, false),
      ).to.eventually.be.rejectedWith(BlError, /order.amount is undefined/);
    });

    it("should reject if branch is not found", () => {
      testOrder.branch = "notFoundBranch";

      return expect(
        orderValidator.validate(testOrder, false),
      ).to.be.rejectedWith(BlError, "not found");
    });

    it("should reject if orderItems is empty or undefined", () => {
      testOrder.orderItems = [];
      return expect(
        orderValidator.validate(testOrder, false),
      ).to.eventually.be.rejectedWith(
        BlError,
        /order.orderItems is empty or undefined/,
      );
    });

    context("when orderItemValidator rejects", () => {
      it("should reject with error", () => {
        orderItemShouldResolve = false;

        return expect(
          orderValidator.validate(testOrder, false),
        ).to.eventually.be.rejectedWith(BlError, /orderItems not valid/);
      });
    });

    context("when orderPlacedValidator rejects", () => {
      it("should reject with error", () => {
        orderPlacedShouldResolve = false;

        return expect(
          orderValidator.validate(testOrder, false),
        ).to.eventually.be.rejectedWith(
          BlError,
          /validation of order.placed failed/,
        );
      });
    });

    context("when branchValidator rejects", () => {
      it("should reject with error", () => {
        branchValidatorShouldResolve = false;
        return expect(
          orderValidator.validate(testOrder, false),
        ).to.eventually.be.rejectedWith(BlError, /validation of branch failed/);
      });
    });

    context("when orderUserDetailValidator rejects", () => {
      it("should reject with error", () => {
        orderUserDetailValidatorShouldResolve = false;

        return expect(
          orderValidator.validate(testOrder, false),
        ).to.be.rejectedWith(BlError, /validation of UserDetail failed/);
      });
    });
  });

  beforeEach(() => {
    orderItemShouldResolve = true;
    orderPlacedShouldResolve = true;
    branchValidatorShouldResolve = true;
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
        acceptedMethods: ["card"],
      },
    };
  });
});
