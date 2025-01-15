import "mocha";

import { PaymentDibsConfirmer } from "@backend/collections/payment/helpers/dibs/payment-dibs-confirmer";
import { PaymentModel } from "@backend/collections/payment/payment.model";
import { DibsEasyPayment } from "@backend/payment/dibs/dibs-easy-payment/dibs-easy-payment";
import { DibsPaymentService } from "@backend/payment/dibs/dibs-payment.service";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { AccessToken } from "@shared/token/access-token";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
chaiUse(chaiAsPromised);
should();

describe("PaymentDibsConfirmer", () => {
  const dibsPaymentService = new DibsPaymentService();
  const dibsPaymentFetchStub = sinon.stub(
    dibsPaymentService,
    "fetchDibsPaymentData",
  );
  const paymentStorage = new BlStorage(PaymentModel);
  const paymentDibsConfirmer = new PaymentDibsConfirmer(
    dibsPaymentService,
    paymentStorage,
  );

  const updatePaymentStub = sinon.stub(paymentStorage, "update");

  const accessToken = {} as AccessToken;

  beforeEach(() => {
    dibsPaymentFetchStub.reset();
    updatePaymentStub.reset();
  });

  describe("confirm()", () => {
    it("should reject if paymentStorage.update rejects", () => {
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
