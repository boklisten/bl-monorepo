import "mocha";

import { BlCollectionName } from "@backend/collections/bl-collection";
import { PaymentDibsHandler } from "@backend/collections/payment/helpers/dibs/payment-dibs-handler";
import { PaymentValidator } from "@backend/collections/payment/helpers/payment.validator";
import { PaymentPatchHook } from "@backend/collections/payment/hooks/payment.patch.hook";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Payment } from "@shared/payment/payment";
import { AccessToken } from "@shared/token/access-token";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chai.use(chaiAsPromised);

describe("PaymentPatchHook", () => {
  const paymentDibsHandler = new PaymentDibsHandler();
  const paymentStorage = new BlDocumentStorage<Payment>(
    BlCollectionName.Payments,
  );
  const paymentValidator = new PaymentValidator();
  const paymentPatchHook = new PaymentPatchHook(
    paymentStorage,
    paymentDibsHandler,
    paymentValidator,
  );

  let testPayment: Payment;

  let testAccessToken: AccessToken;
  let dibsPaymentCreated: boolean;
  let paymentValidated: boolean;

  beforeEach(() => {
    testAccessToken = {
      iss: "",
      aud: "",
      iat: 1,
      exp: 1,
      sub: "user1",
      username: "",
      permission: "customer",
      details: "",
    };

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
  });

  sinon.stub(paymentStorage, "get").callsFake((id: string) => {
    return id === testPayment.id
      ? Promise.resolve(testPayment)
      : Promise.reject(new BlError("not found"));
  });

  sinon
    .stub(paymentDibsHandler, "handleDibsPayment") // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .callsFake((payment, accessToken) => {
      return dibsPaymentCreated
        ? Promise.resolve(testPayment)
        : Promise.reject(new BlError("could not create dibs payment"));
    });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sinon.stub(paymentValidator, "validate").callsFake((valid) => {
    return paymentValidated
      ? Promise.resolve(true)
      : Promise.reject(new BlError("could not validate payment"));
  });

  describe("after()", () => {
    it("should reject if paymentValidator.validate rejects", () => {
      paymentValidated = false;

      return expect(
        paymentPatchHook.after([testPayment], testAccessToken),
      ).to.be.rejectedWith(BlError, /could not validate payment/);
    });

    it("should resolve when given a valid payment", () => {
      return expect(paymentPatchHook.after([testPayment], testAccessToken)).to
        .be.fulfilled;
    });

    context('when payment.method is "dibs"', () => {
      it("should reject if paymentDibsHandler.handleDibsPayment rejects", () => {
        dibsPaymentCreated = false;

        return expect(
          paymentPatchHook.after([testPayment], testAccessToken),
        ).to.be.rejectedWith(BlError, /could not create dibs payment/);
      });
    });

    context("when payment.method is not valid", () => {
      it("should reject with error", () => {
        testPayment.method = "something" as any;

        return expect(
          paymentPatchHook.after([testPayment], testAccessToken),
        ).to.be.rejectedWith(
          BlError,
          /payment.method "something" not supported/,
        );
      });
    });
  });
});
