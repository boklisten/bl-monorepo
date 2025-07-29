import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { PaymentDibsConfirmer } from "#services/legacy/collections/payment/helpers/dibs/payment-dibs-confirmer";
import { DibsEasyPayment } from "#services/payment/dibs/dibs-easy-payment/dibs-easy-payment";
import { DibsPaymentService } from "#services/payment/dibs/dibs-payment.service";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error";
import { Order } from "#shared/order/order";
import { Payment } from "#shared/payment/payment";
chaiUse(chaiAsPromised);
should();

test.group("PaymentDibsConfirmer", (group) => {
  const dibsPaymentService = new DibsPaymentService();
  const paymentDibsConfirmer = new PaymentDibsConfirmer(dibsPaymentService);
  let updatePaymentStub: sinon.SinonStub;
  let dibsPaymentFetchStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    dibsPaymentFetchStub = sandbox.stub(
      dibsPaymentService,
      "fetchDibsPaymentData",
    );
    updatePaymentStub = sandbox.stub(BlStorage.Payments, "update");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if BlStorage.Payments.update rejects", async () => {
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

  test("should reject if dibsEasyPaymentDetails.summary.reservedAmount is not equal to order.amount", async () => {
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

  test("should resolve if payment is valid", async () => {
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

    return expect(paymentDibsConfirmer.confirm(order, payment)).to.eventually.be
      .true;
  });

  /*

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
