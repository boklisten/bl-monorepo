import { PaymentDibsHandler } from "@backend/lib/collections/payment/helpers/dibs/payment-dibs-handler.js";
import { PaymentValidator } from "@backend/lib/collections/payment/helpers/payment.validator.js";
import { PaymentPostHook } from "@backend/lib/collections/payment/hooks/payment.post.hook.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Order } from "@shared/order/order.js";
import { Payment } from "@shared/payment/payment.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("PaymentPostHook", (group) => {
  const paymentValidator = new PaymentValidator();
  const paymentDibsHandler = new PaymentDibsHandler();
  const paymentPostHook = new PaymentPostHook(
    paymentValidator,
    paymentDibsHandler,
  );

  let testOrder: Order;
  let testPayment: Payment;

  // @ts-expect-error fixme: auto ignored
  let testAccessToken;
  let paymentValidated: boolean;
  let handleDibsPaymentValid: boolean;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    testOrder = {
      id: "order1",
      amount: 100,
      orderItems: [],
      branch: "branch1",
      customer: "customer1",
      byCustomer: true,
      payments: [],
      pendingSignature: false,
    };

    testPayment = {
      id: "payment1",
      method: "later",
      order: "order1",
      amount: 0,
      customer: "customer1",
      branch: "branch1",
    };

    testAccessToken = {
      sub: "user1",
      permission: "customer",
    };

    paymentValidated = true;
    handleDibsPaymentValid = true;
    sandbox = createSandbox();

    sandbox.stub(BlStorage.Payments, "get").callsFake((id) => {
      if (id !== testPayment.id) {
        return Promise.reject(new BlError("not found").code(702));
      }

      return Promise.resolve(testPayment);
    });
    sandbox.stub(BlStorage.Payments, "update").callsFake(() => {
      return Promise.resolve(testPayment);
    });

    sandbox.stub(paymentDibsHandler, "handleDibsPayment").callsFake(() => {
      if (!handleDibsPaymentValid) {
        return Promise.reject(new BlError("could not create dibs payment"));
      }
      return Promise.resolve(testPayment);
    });

    sandbox.stub(BlStorage.Orders, "get").callsFake((id) => {
      if (id !== testOrder.id) {
        return Promise.reject(new BlError("not found").code(702));
      }

      return Promise.resolve(testOrder);
    });

    sandbox.stub(BlStorage.Orders, "update").callsFake(() => {
      return Promise.resolve(testOrder);
    });

    sandbox.stub(paymentValidator, "validate").callsFake(() => {
      if (!paymentValidated) {
        return Promise.reject(new BlError("could not validate payment"));
      }

      return Promise.resolve(true);
    });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if ids is empty or undefined", async () => {
    return expect(
      // @ts-expect-error fixme: auto ignored
      paymentPostHook.after([], testAccessToken),
    ).to.eventually.be.rejectedWith(BlError, /payments is empty or undefined/);
  });

  test("should reject if paymentValidator.validate rejects", async () => {
    paymentValidated = false;

    return expect(
      // @ts-expect-error fixme: auto ignored
      paymentPostHook.after([testPayment], testAccessToken),
    ).to.be.rejectedWith(BlError, /payment could not be validated/);
  });

  test("should reject if paymentDibsHandler.handleDibsPayment rejects", async () => {
    testPayment.method = "dibs";
    handleDibsPaymentValid = false;

    return expect(
      // @ts-expect-error fixme: auto ignored
      paymentPostHook.after([testPayment], testAccessToken),
    ).to.be.rejectedWith(BlError, /could not create dibs payment/);
  });
});
