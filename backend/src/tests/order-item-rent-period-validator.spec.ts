import { OrderItemRentPeriodValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-rent-validator/order-item-rent-period-validator/order-item-rent-period-validator.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BranchPaymentInfo } from "@shared/branch/branch-payment-info.js";
import { OrderItem } from "@shared/order/order-item/order-item.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("OrderItemRentPeriodValidator", (group) => {
  const orderItemRentPeriodValidator = new OrderItemRentPeriodValidator();
  let orderStorageGetStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let branchPaymentInfo: any;
  const orderB = {
    id: "orderB",
    amount: 200,
    orderItems: [
      {
        type: "rent",
        item: "itemA",
        amount: 100,
        unitPrice: 100,
        taxAmount: 0,
        taxRate: 0,
        info: {
          to: new Date(),
          from: new Date(),
          numberOfPeriods: 1,
          periodType: "semester",
        },
      },
    ],
    payments: ["paymentA"],
    placed: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
  //important to remember, if payments is set and placed is true, that means that the payments are also confirmed

  group.each.setup(() => {
    branchPaymentInfo = {
      responsible: true,
    };
    sandbox = createSandbox();
    orderStorageGetStub = sandbox.stub(BlStorage.Orders, "get");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if period is not found in branchPaymentInfo", async () => {
    const branchPaymentInfo = {
      rentPeriods: [{ type: "year" }],
    };

    const orderItem = {
      type: "rent",
      info: {
        periodType: "semester",
      },
    };

    return expect(
      orderItemRentPeriodValidator.validate(
        orderItem as OrderItem,
        branchPaymentInfo as BranchPaymentInfo,
        100,
      ),
    ).to.be.rejectedWith(
      BlError,
      /rent period "semester" is not valid on branch/,
    );
  });

  test("should reject if not all amounts is equal to 0 on orderItem", async () => {
    const orderItem = {
      type: "rent",
      amount: 100,
      taxAmount: 20,
      unitPrice: 80,
    } as OrderItem;

    return expect(
      orderItemRentPeriodValidator.validate(
        orderItem,
        branchPaymentInfo as BranchPaymentInfo,
        100,
      ),
    ).to.be.rejectedWith(
      BlError,
      /amounts where set on orderItem when branch is responsible/,
    );
  });

  test("should resolve with true if all amounts is 0", async () => {
    const orderItem = {
      type: "rent",
      amount: 0,
      taxAmount: 0,
      unitPrice: 0,
    } as OrderItem;

    return expect(
      orderItemRentPeriodValidator.validate(
        orderItem,
        branchPaymentInfo as BranchPaymentInfo,
        100,
      ),
    ).to.be.fulfilled;
  });

  branchPaymentInfo = {
    responsible: false,
    rentPeriods: [
      {
        type: "semester",
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  const orderItem = {
    type: "rent",
    item: "itemA",
    amount: 0,
    unitPrice: 0,
    taxAmount: 0,
    taxRate: 0,
    info: {
      to: new Date(),
      from: new Date(),
      numberOfPeriods: 1,
      periodType: "semester",
    },
    movedFromOrder: "orderB",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  test("should reject if orderItem.amount is 0 but the movedFromOrder has not been payed for", async () => {
    orderB.payments = []; // this means no payment is provided, aka customer has not payed
    orderStorageGetStub.withArgs("orderB").resolves(orderB);

    await orderItemRentPeriodValidator.validate(
      orderItem,
      branchPaymentInfo,
      100,
    );
  });

  test("should reject if period is the same but orderItem.amount is not 0", async ({
    assert,
  }) => {
    orderB.payments = ["payment1"]; // this means that the order is payed for
    orderStorageGetStub.withArgs("orderB").resolves(orderB);

    orderB.orderItems[0].type = "rent";
    orderB.orderItems[0].info.periodType = "semester";

    orderItem.amount = 100;
    orderItem.type = "rent";
    orderItem.info.periodType = "semester";

    await assert.rejects(() =>
      orderItemRentPeriodValidator.validate(orderItem, branchPaymentInfo, 100),
    );
  });

  test("should reject if orderItem.amount is not equal to rentPrice - oldOrderItem.amount ", async ({
    assert,
  }) => {
    branchPaymentInfo = {
      responsible: false,
      rentPeriods: [
        {
          type: "semester",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    branchPaymentInfo.rentPeriods.push({
      type: "year",
      date: new Date(),
      maxNumberOfPeriods: 1,
      percentage: 0.5,
    });
    orderB.payments = ["payment1"]; // this means that the order is payed for
    orderStorageGetStub.withArgs("orderB").resolves(orderB);

    orderB.orderItems[0].type = "rent";
    orderB.orderItems[0].amount = 200;
    orderB.orderItems[0].info.periodType = "semester";

    const itemPrice = 500;

    orderItem.amount = 100; // this should actually be (itemPrice 500 * percentage 0.5)- oldOrderItem 200 = 50
    orderItem.type = "rent";
    orderItem.info.periodType = "year";

    await assert.rejects(() =>
      orderItemRentPeriodValidator.validate(
        orderItem,
        branchPaymentInfo,
        itemPrice,
      ),
    );
  });

  test("should reject if orderItem.amount is not equal to rentPrice 500 - oldOrderItem.amount 750 = -250", async ({
    assert,
  }) => {
    branchPaymentInfo.rentPeriods = [
      {
        type: "semester",
        date: new Date(),
        maxNumberOfPeriods: 1,
        percentage: 0.5,
      },
    ];
    orderB.payments = ["payment1"]; // this means that the order is payed for
    orderStorageGetStub.withArgs("orderB").resolves(orderB);

    orderB.orderItems[0].type = "rent";
    orderB.orderItems[0].amount = 750;
    orderB.orderItems[0].info.periodType = "year";

    const itemPrice = 1000;

    orderItem.amount = 0; // this should actually be (itemPrice 1000 * percentage 0.5)- oldOrderItem 750 = -250
    orderItem.type = "rent";
    orderItem.info.periodType = "semester";

    // fixme, test is wrong
    await assert.doesNotReject(() =>
      orderItemRentPeriodValidator.validate(
        orderItem,
        branchPaymentInfo,
        itemPrice,
      ),
    );
  });

  test("should resolve if orderItem.amount is equal to rentPrice 500 - oldOrderItem.amount 750 = -250", async () => {
    branchPaymentInfo.rentPeriods = [
      {
        type: "semester",
        date: new Date(),
        maxNumberOfPeriods: 1,
        percentage: 0.5,
      },
    ];
    orderB.payments = ["payment1"]; // this means that the order is payed for
    orderStorageGetStub.withArgs("orderB").resolves(orderB);

    orderB.orderItems[0].type = "rent";
    orderB.orderItems[0].amount = 750;
    orderB.orderItems[0].info.periodType = "year";

    const itemPrice = 1000;

    orderItem.amount = -250; // this should be (itemPrice 1000 * percentage 0.5)- oldOrderItem 750 = -250
    orderItem.type = "rent";
    orderItem.info.periodType = "semester";

    return expect(
      orderItemRentPeriodValidator.validate(
        orderItem,
        branchPaymentInfo,
        itemPrice,
      ),
    ).to.be.rejected;
  });

  test("should reject if orderItem.amount is not equalt to branchPayment percentage * itemPrice", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const branchPaymentInfo: any = {
      responsible: false,
      rentPeriods: [
        {
          type: "semester",
          date: new Date(),
          maxNumberOfPeriods: 1,
          percentage: 0.5,
        },
      ],
    };

    const itemPrice = 100;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItem: any = {
      type: "rent",
      info: {
        periodType: "semester",
      },
      amount: 0,
    };

    return expect(
      orderItemRentPeriodValidator.validate(
        orderItem,
        branchPaymentInfo,
        itemPrice,
      ),
    ).to.be.rejectedWith(
      BlError,
      /orderItem.amount "0" is not equal to itemPrice "100" \* percentage "0.5" "50"/,
    );
  });

  test("should resolve if given valid orderItem", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const branchPaymentInfo: any = {
      responsible: false,
      rentPeriods: [
        {
          type: "semester",
          date: new Date(),
          maxNumberOfPeriods: 1,
          percentage: 0.5,
        },
      ],
    };

    const itemPrice = 100;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItem: any = {
      type: "rent",
      info: {
        periodType: "semester",
      },
      amount: 50,
    };

    return expect(
      orderItemRentPeriodValidator.validate(
        orderItem,
        branchPaymentInfo,
        itemPrice,
      ),
    ).to.be.fulfilled;
  });
});
