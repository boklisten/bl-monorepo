import { PaymentDibsConfirmer } from "@backend/lib/collections/payment/helpers/dibs/payment-dibs-confirmer.js";
import { DibsPaymentService } from "@backend/lib/payment/dibs/dibs-payment.service.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();
test.group("PaymentDibsConfirmer", (group) => {
    const dibsPaymentService = new DibsPaymentService();
    const paymentDibsConfirmer = new PaymentDibsConfirmer(dibsPaymentService);
    let updatePaymentStub;
    let dibsPaymentFetchStub;
    let sandbox;
    group.each.setup(() => {
        sandbox = createSandbox();
        dibsPaymentFetchStub = sandbox.stub(dibsPaymentService, "fetchDibsPaymentData");
        updatePaymentStub = sandbox.stub(BlStorage.Payments, "update");
    });
    group.each.teardown(() => {
        sandbox.restore();
    });
    test("should reject if BlStorage.Payments.update rejects", async () => {
        dibsPaymentFetchStub.resolves({
            orderDetails: { amount: 12000, reference: "order1" },
            summary: { reservedAmount: 12000 },
        });
        const payment = {
            id: "payment1",
            info: { paymentId: "dibs1" },
            amount: 120,
        };
        const order = {
            id: "order1",
            amount: 120,
            payments: [payment.id],
        };
        updatePaymentStub.rejects(new BlError("could not update payment"));
        return expect(paymentDibsConfirmer.confirm(order, payment)).to.eventually.be.rejectedWith(BlError, /payment could not be updated with dibs information/);
    });
    test("should reject if dibsEasyPaymentDetails.summary.reservedAmount is not equal to order.amount", async () => {
        dibsPaymentFetchStub.resolves({
            orderDetails: { amount: 10000, reference: "order1" },
            summary: { reservedAmount: 10000 },
        });
        const payment = {
            id: "payment1",
            info: { paymentId: "dibs1" },
            amount: 110,
        };
        const order = {
            id: "order1",
            amount: 110,
            payments: [payment.id],
        };
        return expect(paymentDibsConfirmer.confirm(order, payment)).to.eventually.be.rejectedWith(BlError, /dibsEasyPaymentDetails.summary.reservedAmount "10000" is not equal to payment.amount "11000"/);
    });
    test("should resolve if payment is valid", async () => {
        dibsPaymentFetchStub.resolves({
            orderDetails: { amount: 12000, reference: "order1" },
            summary: { reservedAmount: 12000 },
        });
        updatePaymentStub.resolves({});
        const payment = {
            id: "payment1",
            info: { paymentId: "dibs1" },
            amount: 120,
        };
        const order = {
            id: "order1",
            amount: 120,
            payments: [payment.id],
        };
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
