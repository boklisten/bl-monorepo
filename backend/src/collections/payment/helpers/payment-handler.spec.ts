import "mocha";

import { PaymentDibsConfirmer } from "@backend/collections/payment/helpers/dibs/payment-dibs-confirmer.js";
import { PaymentHandler } from "@backend/collections/payment/helpers/payment-handler.js";
import { DibsPaymentService } from "@backend/payment/dibs/dibs-payment.service.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Delivery } from "@shared/delivery/delivery.js";
import { Order } from "@shared/order/order.js";
import { Payment } from "@shared/payment/payment.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("PaymentHandler", () => {
  let testOrder: Order;

  const dibsPaymentService = new DibsPaymentService();
  const paymentDibsConfirmer = new PaymentDibsConfirmer(dibsPaymentService);
  const paymentHandler = new PaymentHandler(paymentDibsConfirmer);

  beforeEach(() => {
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
  let paymentStorageUpdateStub: sinon.SinonStub;
  let deliveryGetStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = createSandbox();
    paymentDibsConfirmStub = sandbox.stub(paymentDibsConfirmer, "confirm");
    paymentStorageGetManyStub = sandbox.stub(BlStorage.Payments, "getMany");
    paymentStorageUpdateStub = sandbox.stub(BlStorage.Payments, "update");
    deliveryGetStub = sandbox.stub(BlStorage.Deliveries, "get");
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("confirmPayments()", () => {
    it("should reject if payments in order is not found", () => {
      paymentStorageGetManyStub.rejects(new BlError("not found").code(702));

      return expect(
        paymentHandler.confirmPayments(testOrder),
      ).to.be.rejectedWith(BlError, /one or more payments was not found/);
    });

    describe("when there is only one payment", () => {
      const methods = ["vipps", "card", "cash", "dibs"];

      for (const method of methods) {
        it("should confirm if amount is equal to order", () => {
          const order = { amount: 100, payments: ["payment1"] } as Order;
          const payments = [{ method: method, amount: 100 }] as Payment[];

          paymentStorageGetManyStub.resolves(payments);

          return expect(
            paymentHandler.confirmPayments(order),
          ).to.eventually.be.eq(payments);
        });

        it("should reject if amount is not equal to order", () => {
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

      const employeeOnlyMethods = ["card", "cash", "vipps"];

      for (const method of employeeOnlyMethods) {
        it("should reject if order.byCustomer is set and payment.method only permitted to customer", () => {
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
    });

    describe('when paymentMethod is "dibs"', () => {
      it("should reject if paymentDibsValidator.validate rejects", () => {
        paymentStorageGetManyStub.resolves([
          {
            amount: testOrder.amount,
            method: "dibs",
            confirmed: false,
          } as Payment,
        ]);

        deliveryGetStub.resolves({ id: "delivery1", amount: 0 } as Delivery);

        paymentDibsConfirmStub.rejects(new BlError("dibs payment not valid"));

        return expect(
          paymentHandler.confirmPayments(testOrder),
        ).to.be.rejectedWith(BlError, /dibs payment not valid/);
      });

      it("should resolve if paymentDibsValidator.validate resolves", () => {
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
    });
  });

  describe("when there are multiple payments", () => {
    it("should confirm if amount is equal to order", () => {
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

    it("should reject if amount is not equal to order", () => {
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

    it("should reject if there are multiple payments and one of them are of methond dibs", () => {
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

    it('should reject if there are multiple payments with method "dibs"', () => {
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
  });

  describe('when paymentMethod is "dibs"', () => {
    /*
      let testDibsEasyPayment: DibsEasyPayment;

      beforeEach(() => {
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

      it('should reject if payment.info.paymentId is not defined', () => {
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

      it('should reject if payment.info.paymentId is not found on dibs api', () => {
        testPayment1.info = {
          paymentId: 'notFoundDibsEasyPayment',
        };

        return expect(
          paymentHandler.confirmPayments(testOrder, testAccessToken),
        ).to.be.rejectedWith(BlError, /could not get dibs payment on dibs api/);
      });

      it('should reject if dibsEasyPayment.orderDetails.reference is not equal to order.id', () => {
        testDibsEasyPayment.orderDetails.reference = 'notAValidOrderId';

        return expect(
          paymentHandler.confirmPayments(testOrder, testAccessToken),
        ).to.be.rejectedWith(
          BlError,
          /dibsEasyPayment.orderDetails.reference is not equal to order.id/,
        );
      });

      it('should reject if summary is undefined', () => {
        testDibsEasyPayment.summary = undefined;

        return expect(
          paymentHandler.confirmPayments(testOrder, testAccessToken),
        ).to.be.rejectedWith(BlError, /dibsEasyPayment.summary is undefined/);
      });

      it('should reject if summary.reservedAmount is undefined', () => {
        testDibsEasyPayment.summary = {};

        return expect(
          paymentHandler.confirmPayments(testOrder, testAccessToken),
        ).to.be.rejectedWith(
          BlError,
          /dibsEasyPayment.summary.reservedAmount is undefined/,
        );
      });

      it('should reject if summary.reservedAmount is not equal to payment.amount', () => {
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

      it('should update payment with confirmed true if dibsEasyPayment is valid', done => {
        testPayment1.confirmed = false;

        paymentHandler
          .confirmPayments(testOrder, testAccessToken)
          .then((payments: Payment[]) => {
            expect(payments[0].confirmed).to.be.true;
            done();
          });
      });

      */
  });
});
