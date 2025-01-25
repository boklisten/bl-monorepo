import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Order } from "@shared/order/order.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import HttpHandler from "#services/http/http.handler";
import { DibsEasyOrder } from "#services/payment/dibs/dibs-easy-order";
import { DibsPaymentService } from "#services/payment/dibs/dibs-payment.service";

chaiUse(chaiAsPromised);
should();

test.group("DibsPaymentService", (group) => {
  const dibsPaymentService: DibsPaymentService = new DibsPaymentService();
  let testOrder: Order;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let testDibsEasyPaymentResponse: any;
  let httpHandlerGetSuccess: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const testUser = {} as any;
  let sandbox = sinon.createSandbox();

  group.each.setup(() => {
    testOrder = {
      id: "o1",
      amount: 100,
      customer: "",
      byCustomer: true,
      branch: "b1",
      orderItems: [
        {
          type: "rent",
          title: "Signatur 3",
          amount: 100,
          unitPrice: 100,
          taxRate: 0,
          taxAmount: 0,
          item: "i1",
        },
      ],
      payments: [],
      delivery: "",
      active: false,
      user: {
        id: "u1",
      },
      lastUpdated: new Date(),
      creationTime: new Date(),
      pendingSignature: false,
    };
    testDibsEasyPaymentResponse = {
      payment: {
        paymentId: "dibsPaymentId1",
      },
    };
    httpHandlerGetSuccess = true;
    sandbox = createSandbox();
    sandbox.stub(HttpHandler, "get").callsFake(() => {
      if (!httpHandlerGetSuccess) {
        return Promise.reject(new BlError("could not get resource"));
      }

      return Promise.resolve(testDibsEasyPaymentResponse);
    });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should throw error if order.id is not defined", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.id = null;

    expect(() => {
      dibsPaymentService.orderToDibsEasyOrder(testUser, testOrder);
    }).to.throw(BlError, /order.id is not defined/);
  });

  test("should throw error if order.amount is 0", async () => {
    testOrder.amount = 0;
    expect(() => {
      dibsPaymentService.orderToDibsEasyOrder(testUser, testOrder);
    }).to.throw(BlError, /order.amount is zero/);
  });

  test("should throw error if order.byCustomer = false", async () => {
    testOrder.byCustomer = false;
    expect(() => {
      dibsPaymentService.orderToDibsEasyOrder(testUser, testOrder);
    }).to.throw(BlError, /order.byCustomer is false/);
  });

  test("should return a total amount of 10000 when item costs 100kr", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].amount = 100;

    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].unitPrice = 100;
    const deo: DibsEasyOrder = dibsPaymentService.orderToDibsEasyOrder(
      testUser,
      testOrder,
    );

    expect(deo.order.amount).to.eql(10000);
  });

  test('should return a dibsEasyOrder.reference equal to "103"', async () => {
    testOrder.id = "103";
    const deo: DibsEasyOrder = dibsPaymentService.orderToDibsEasyOrder(
      testUser,
      testOrder,
    );
    expect(deo.order.reference).to.eql("103");
  });

  test('should have name of "signatur 3"', async () => {
    const title = "signatur 3";

    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].title = title;

    const deo = dibsPaymentService.orderToDibsEasyOrder(testUser, testOrder);

    // @ts-expect-error fixme: auto ignored
    expect(deo.order.items[0].name).to.eql(title);
  });

  test("should have grossTotalAmount of 15000", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].amount = 150;

    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].unitPrice = 150;
    testOrder.amount = 150;
    const deo = dibsPaymentService.orderToDibsEasyOrder(testUser, testOrder);

    // @ts-expect-error fixme: auto ignored
    expect(deo.order.items[0].grossTotalAmount).to.eql(15000);
  });

  test("should have taxAmount equal to 5000", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].unitPrice = 100;

    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].taxRate = 0.5;

    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].taxAmount = 50;

    const deo = dibsPaymentService.orderToDibsEasyOrder(testUser, testOrder);

    // @ts-expect-error fixme: auto ignored
    expect(deo.order.items[0].taxAmount).to.eql(5000);
  });

  test("should have taxRate equal to 2500", async () => {
    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].unitPrice = 100;

    // @ts-expect-error fixme: auto ignored
    testOrder.orderItems[0].taxRate = 0.25;

    const deo = dibsPaymentService.orderToDibsEasyOrder(testUser, testOrder);

    // @ts-expect-error fixme: auto ignored
    expect(deo.order.items[0].taxRate).to.eql(2500);
  });

  test("should have reference equal to the order.id", async () => {
    testOrder.id = "orderId1";

    const deo = dibsPaymentService.orderToDibsEasyOrder(testUser, testOrder);

    expect(deo.order.reference).to.eql(testOrder.id);
  });

  test("should have items.length equal to the number of items in order", async () => {
    const deo = dibsPaymentService.orderToDibsEasyOrder(testUser, testOrder);

    expect(deo.order.items.length).to.eql(testOrder.orderItems.length);
  });

  test("should reject if httpHandler rejects", async () => {
    httpHandlerGetSuccess = false;
    expect(
      dibsPaymentService.fetchDibsPaymentData("dibsPaymentId1"),
    ).to.be.rejectedWith(
      BlError,
      /could not get payment details for paymentId "dibsPaymentId1"/,
    );
  });

  test("should reject if dibsResponse does not include a payment", async () => {
    testDibsEasyPaymentResponse = {
      somethingElse: true,
    };

    dibsPaymentService
      .fetchDibsPaymentData("dibsPaymentId1")
      .catch((err: BlError) => {
        // @ts-expect-error fixme: auto ignored
        expect(err.errorStack[0].getMsg()).to.be.eq(
          "dibs response did not include payment information",
        );
      });
  });

  test("should resolve with a dibsEasyPayment object with correct paymentId", async () => {
    testDibsEasyPaymentResponse = {
      payment: {
        paymentId: "aPaymentId",
      },
    };

    expect(
      dibsPaymentService.fetchDibsPaymentData("aPaymentId"),
    ).to.eventually.be.eql({ paymentId: "aPaymentId" });
  });
});
