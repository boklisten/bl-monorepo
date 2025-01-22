import { PaymentDibsConfirmer } from "@backend/express/collections/payment/helpers/dibs/payment-dibs-confirmer.js";
import { PaymentHandler } from "@backend/express/collections/payment/helpers/payment-handler.js";
import { DibsPaymentService } from "@backend/express/payment/dibs/dibs-payment.service.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Delivery } from "@shared/delivery/delivery.js";
import { Order } from "@shared/order/order.js";
import { Payment } from "@shared/payment/payment.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("PaymentHandler", (group) => {
  let testOrder: Order;
  const methods = ["vipps", "card", "cash", "dibs"];
  const employeeOnlyMethods = ["card", "cash", "vipps"];
  const dibsPaymentService = new DibsPaymentService();
  const paymentDibsConfirmer = new PaymentDibsConfirmer(dibsPaymentService);
  const paymentHandler = new PaymentHandler(paymentDibsConfirmer);

  group.each.setup(() => {
    testOrder = {
      id: "order1",
      amount: 200,
      orderItems: [],
      branch: "branch1",
      customer: "customer1",
      byCustomer: true,
      payments: ["payment1"],
      delivery: "delivery1",
      pendingSignature: false,
    } as Order;
  });

  let paymentDibsConfirmStub: sinon.SinonStub;
  let paymentStorageGetManyStub: sinon.SinonStub;
  let deliveryGetStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    paymentDibsConfirmStub = sandbox.stub(paymentDibsConfirmer, "confirm");
    paymentStorageGetManyStub = sandbox.stub(BlStorage.Payments, "getMany");
    deliveryGetStub = sandbox.stub(BlStorage.Deliveries, "get");
    sandbox.stub(BlStorage.Payments, "update");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if payments in order is not found", async () => {
    paymentStorageGetManyStub.rejects(new BlError("not found").code(702));

    return expect(paymentHandler.confirmPayments(testOrder)).to.be.rejectedWith(
      BlError,
      /one or more payments was not found/,
    );
  });

  for (const method of methods) {
    test("should confirm if amount is equal to order", async () => {
      const order = { amount: 100, payments: ["payment1"] } as Order;
      const payments = [{ method: method, amount: 100 }] as Payment[];

      paymentStorageGetManyStub.resolves(payments);

      return expect(paymentHandler.confirmPayments(order)).to.eventually.be.eq(
        payments,
      );
    });

    test("should reject if amount is not equal to order", async () => {
      const order = { amount: 110, payments: ["payment1"] } as Order;
      const payments = [{ method: method, amount: 500 }] as Payment[];

      paymentStorageGetManyStub.resolves(payments);

      return expect(
        paymentHandler.confirmPayments(order),
      ).to.eventually.be.rejectedWith(
        BlError,
        /payment amounts does not equal order.amount/,
      );
    });
  }

  for (const method of employeeOnlyMethods) {
    test("should reject if order.byCustomer is set and payment.method only permitted to customer", async () => {
      const order = {
        amount: 111,
        payments: ["payment1"],
        byCustomer: true,
      } as Order;
      const payments = [{ method: method, amount: 111 }] as Payment[];

      paymentStorageGetManyStub.resolves(payments);

      return expect(
        paymentHandler.confirmPayments(order),
      ).to.eventually.be.rejectedWith(
        BlError,
        `payment method "${method}" is not permitted for customer`,
      );
    });
  }

  test("should reject if paymentDibsValidator.validate rejects", async () => {
    paymentStorageGetManyStub.resolves([
      {
        amount: testOrder.amount,
        method: "dibs",
        confirmed: false,
      } as Payment,
    ]);

    deliveryGetStub.resolves({ id: "delivery1", amount: 0 } as Delivery);

    paymentDibsConfirmStub.rejects(new BlError("dibs payment not valid"));

    return expect(paymentHandler.confirmPayments(testOrder)).to.be.rejectedWith(
      BlError,
      /dibs payment not valid/,
    );
  });

  test("should resolve if paymentDibsValidator.validate resolves", async () => {
    const payments = [
      { amount: testOrder.amount, method: "dibs", confirmed: false },
    ] as Payment[];

    paymentStorageGetManyStub.resolves(payments);
    deliveryGetStub.resolves({ id: "delivery1", amount: 0 } as Delivery);
    paymentDibsConfirmStub.resolves(true);

    return expect(
      paymentHandler.confirmPayments(testOrder),
    ).to.eventually.be.eq(payments);
  });

  test("should confirm if amount is equal to order", async () => {
    const order = {
      amount: 300,
      payments: ["payment1", "payment2", "payment3"],
    } as Order;
    const payments = [
      { method: "vipps", amount: 100 },
      { method: "cash", amount: 100 },
      { method: "card", amount: 100 },
    ] as Payment[];

    paymentStorageGetManyStub.resolves(payments);

    return expect(paymentHandler.confirmPayments(order)).to.eventually.be.eq(
      payments,
    );
  });

  test("should reject if amount is not equal to order", async () => {
    const order = {
      amount: 600,
      payments: ["payment1", "payment2"],
    } as Order;
    const payments = [
      { method: "cash", amount: 500 },
      { method: "vipps", amount: 300 },
    ] as Payment[];

    paymentStorageGetManyStub.resolves(payments);

    return expect(
      paymentHandler.confirmPayments(order),
    ).to.eventually.be.rejectedWith(
      BlError,
      /payment amounts does not equal order.amount/,
    );
  });

  test("should reject if there are multiple payments and one of them are of methond dibs", async () => {
    const order = {
      amount: 550,
      payments: ["payment1", "payment2", "payments3"],
    } as Order;
    const payments = [
      { id: "payment1", method: "cash", amount: 100 },
      { id: "payment2", method: "dibs", amount: 150 },
      { id: "payment3", method: "vipps", amount: 300 },
    ] as Payment[];

    paymentStorageGetManyStub.resolves(payments);

    return expect(
      paymentHandler.confirmPayments(order),
    ).to.eventually.be.rejectedWith(
      BlError,
      /multiple payments found but "payment2" have method dibs/,
    );
  });

  test('should reject if there are multiple payments with method "dibs"', async () => {
    const order = {
      amount: 250,
      payments: ["payment1", "payment2"],
    } as Order;
    const payments = [
      { id: "payment1", method: "dibs", amount: 100 },
      { id: "payment2", method: "dibs", amount: 150 },
    ] as Payment[];

    paymentStorageGetManyStub.resolves(payments);

    return expect(
      paymentHandler.confirmPayments(order),
    ).to.eventually.be.rejectedWith(
      BlError,
      /multiple payments found but "payment1" have method dibs/,
    );
  });

  /*
      let testDibsEasyPayment: DibsEasyPayment;

      group.each.setup(() => {
        testDibsEasyPayment = {
          paymentId: 'dibsEasyPayment1',
          summary: {
            reservedAmount: 20000,
          },
          consumer: {},
          orderDetails: {
            amount: 200,
            currency: 'NOK',
            reference: 'order1',
          },
          created: new Date().toISOString(),
        };

        testPayment1.info = {
          paymentId: 'dibsEasyPayment1',
        };
      });
       */
  /*
      sinon
        .stub(dibsPaymentService, 'fetchDibsPaymentData')
        .callsFake((dibsPaymentId: string) => {
          if (dibsPaymentId !== testDibsEasyPayment.paymentId) {
            return Promise.reject(new BlError('could not get payment'));
          }
          return Promise.resolve(testDibsEasyPayment);
        });

      test('should reject if payment.info.paymentId is not defined', async () => {
        testPayment1.info = {
          paymentId: undefined,
        };

        return expect( 
          paymentHandler.confirmPayments(testOrder, testAccessToken),
        ).to.be.rejectedWith(
          BlError,
          /payment.method is "dibs" but payment.info.paymentId is undefined/,
        );
      });

      test('should reject if payment.info.paymentId is not found on dibs api', async () => {
        testPayment1.info = {
          paymentId: 'notFoundDibsEasyPayment',
        };

        return expect( 
          paymentHandler.confirmPayments(testOrder, testAccessToken),
        ).to.be.rejectedWith(BlError, /could not get dibs payment on dibs api/);
      });

      test('should reject if dibsEasyPayment.orderDetails.reference is not equal to order.id', async () => {
        testDibsEasyPayment.orderDetails.reference = 'notAValidOrderId';

        return expect( 
          paymentHandler.confirmPayments(testOrder, testAccessToken),
        ).to.be.rejectedWith(
          BlError,
          /dibsEasyPayment.orderDetails.reference is not equal to order.id/,
        );
      });

      test('should reject if summary is undefined', async () => {
        testDibsEasyPayment.summary = undefined;

        return expect( 
          paymentHandler.confirmPayments(testOrder, testAccessToken),
        ).to.be.rejectedWith(BlError, /dibsEasyPayment.summary is undefined/);
      });

      test('should reject if summary.reservedAmount is undefined', async () => {
        testDibsEasyPayment.summary = {};

        return expect( 
          paymentHandler.confirmPayments(testOrder, testAccessToken),
        ).to.be.rejectedWith(
          BlError,
          /dibsEasyPayment.summary.reservedAmount is undefined/,
        );
      });

      test('should reject if summary.reservedAmount is not equal to payment.amount', async () => {
        testDibsEasyPayment.summary = {
          reservedAmount: 10000,
        };
        testPayment1.amount = 200;

        return expect( 
          paymentHandler.confirmPayments(testOrder, testAccessToken),
        ).to.be.rejectedWith(
          BlError,
          /dibsEasyPayment.summary.reservedAmount "10000" is not equal to payment.amount "20000"/,
        );
      });

      test('should update payment with confirmed true if dibsEasyPayment is valid', done => {
        testPayment1.confirmed = false;

        paymentHandler
          .confirmPayments(testOrder, testAccessToken)
          .then((payments: Payment[]) => {
            return expect( payments[0].confirmed).to.be.true;
            
          });
      });

      */
});
