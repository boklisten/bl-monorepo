import "mocha";

import { PaymentDibsConfirmer } from "@backend/collections/payment/helpers/dibs/payment-dibs-confirmer.js";
import { DibsEasyPayment } from "@backend/payment/dibs/dibs-easy-payment/dibs-easy-payment.js";
import { DibsPaymentService } from "@backend/payment/dibs/dibs-payment.service.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Order } from "@shared/order/order.js";
import { Payment } from "@shared/payment/payment.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();

describe("PaymentDibsConfirmer", () => {
  const dibsPaymentService = new DibsPaymentService();
  const paymentDibsConfirmer = new PaymentDibsConfirmer(dibsPaymentService);
  let updatePaymentStub: sinon.SinonStub;
  let dibsPaymentFetchStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = createSandbox();
    dibsPaymentFetchStub = sandbox.stub(
      dibsPaymentService,
      "fetchDibsPaymentData",
    );
    updatePaymentStub = sandbox.stub(BlStorage.Payments, "update");
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("confirm()", () => {
    it("should reject if BlStorage.Payments.update rejects", () => {
      dibsPaymentFetchStub.resolves({
        orderDetails: { amount: 12000, reference: "order1" },
        summary: { reservedAmount: 12000 },
      } as DibsEasyPayment);

      const payment = {
        id: "payment1",
        info: { paymentId: "dibs1" },
        amount: 120,
      } as unknown as Payment;

      const order = {
        id: "order1",
        amount: 120,
        payments: [payment.id],
      } as Order;

      updatePaymentStub.rejects(new BlError("could not update payment"));

      return expect(
        paymentDibsConfirmer.confirm(order, payment),
      ).to.eventually.be.rejectedWith(
        BlError,
        /payment could not be updated with dibs information/,
      );
    });

    it("should reject if dibsEasyPaymentDetails.summary.reservedAmount is not equal to order.amount", () => {
      dibsPaymentFetchStub.resolves({
        orderDetails: { amount: 10000, reference: "order1" },
        summary: { reservedAmount: 10000 },
      } as DibsEasyPayment);

      const payment = {
        id: "payment1",
        info: { paymentId: "dibs1" },
        amount: 110,
      } as unknown as Payment;

      const order = {
        id: "order1",
        amount: 110,
        payments: [payment.id],
      } as Order;

      return expect(
        paymentDibsConfirmer.confirm(order, payment),
      ).to.eventually.be.rejectedWith(
        BlError,
        /dibsEasyPaymentDetails.summary.reservedAmount "10000" is not equal to payment.amount "11000"/,
      );
    });

    it("should resolve if payment is valid", () => {
      dibsPaymentFetchStub.resolves({
        orderDetails: { amount: 12000, reference: "order1" },
        summary: { reservedAmount: 12000 },
      } as DibsEasyPayment);

      updatePaymentStub.resolves({} as Payment);

      const payment = {
        id: "payment1",
        info: { paymentId: "dibs1" },
        amount: 120,
      } as unknown as Payment;

      const order = {
        id: "order1",
        amount: 120,
        payments: [payment.id],
      } as Order;

      return expect(paymentDibsConfirmer.confirm(order, payment)).to.eventually
        .be.true;
    });
  });

  /*

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
