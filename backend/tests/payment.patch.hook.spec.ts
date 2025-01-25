import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Payment } from "@shared/payment/payment.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { PaymentDibsHandler } from "#services/collections/payment/helpers/dibs/payment-dibs-handler";
import { PaymentValidator } from "#services/collections/payment/helpers/payment.validator";
import { PaymentPatchHook } from "#services/collections/payment/hooks/payment.patch.hook";
import { BlStorage } from "#services/storage/bl-storage";

chaiUse(chaiAsPromised);
should();

test.group("PaymentPatchHook", (group) => {
  const paymentDibsHandler = new PaymentDibsHandler();
  const paymentValidator = new PaymentValidator();
  const paymentPatchHook = new PaymentPatchHook(
    paymentDibsHandler,
    paymentValidator,
  );

  let testPayment: Payment;

  let dibsPaymentCreated: boolean;
  let paymentValidated: boolean;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    testPayment = {
      id: "payment1",
      method: "dibs",
      order: "order1",
      amount: 200,
      customer: "customer1",
      branch: "branch1",
    };

    paymentValidated = true;
    dibsPaymentCreated = true;

    sandbox = createSandbox();
    sandbox.stub(BlStorage.Payments, "get").callsFake((id) => {
      return id === testPayment.id
        ? Promise.resolve(testPayment)
        : Promise.reject(new BlError("not found"));
    });

    sandbox.stub(paymentDibsHandler, "handleDibsPayment").callsFake(() => {
      return dibsPaymentCreated
        ? Promise.resolve(testPayment)
        : Promise.reject(new BlError("could not create dibs payment"));
    });

    sandbox.stub(paymentValidator, "validate").callsFake(() => {
      return paymentValidated
        ? Promise.resolve(true)
        : Promise.reject(new BlError("could not validate payment"));
    });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if paymentValidator.validate rejects", async () => {
    paymentValidated = false;

    return expect(paymentPatchHook.after([testPayment])).to.be.rejectedWith(
      BlError,
      /could not validate payment/,
    );
  });

  test("should resolve when given a valid payment", async () => {
    return expect(paymentPatchHook.after([testPayment])).to.be.fulfilled;
  });

  test("should reject if paymentDibsHandler.handleDibsPayment rejects", async () => {
    dibsPaymentCreated = false;

    return expect(paymentPatchHook.after([testPayment])).to.be.rejectedWith(
      BlError,
      /could not create dibs payment/,
    );
  });

  test("should reject with error", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    testPayment.method = "something" as any;

    return expect(paymentPatchHook.after([testPayment])).to.be.rejectedWith(
      BlError,
      /payment.method "something" not supported/,
    );
  });
});
