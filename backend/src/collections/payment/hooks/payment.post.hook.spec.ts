import "mocha";

import { BlCollectionName } from "@backend/collections/bl-collection";
import { PaymentDibsHandler } from "@backend/collections/payment/helpers/dibs/payment-dibs-handler";
import { PaymentValidator } from "@backend/collections/payment/helpers/payment.validator";
import { PaymentPostHook } from "@backend/collections/payment/hooks/payment.post.hook";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("PaymentPostHook", () => {
  const paymentValidator = new PaymentValidator();
  const orderStorage = new BlDocumentStorage<Order>(BlCollectionName.Orders);
  const paymentStorage = new BlDocumentStorage<Payment>(
    BlCollectionName.Payments,
  );
  const paymentDibsHandler = new PaymentDibsHandler();
  const paymentPostHook = new PaymentPostHook(
    paymentStorage,
    orderStorage,
    paymentValidator,
    paymentDibsHandler,
  );

  let testOrder: Order;
  let testPayment: Payment;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let testAccessToken;
  let paymentValidated: boolean;
  let handleDibsPaymentValid: boolean;

  beforeEach(() => {
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
  });

  sinon.stub(paymentStorage, "get").callsFake((id: string) => {
    if (id !== testPayment.id) {
      return Promise.reject(new BlError("not found").code(702));
    }

    return Promise.resolve(testPayment);
  }); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sinon.stub(paymentStorage, "update").callsFake((id, data, accessToken) => {
    return Promise.resolve(testPayment);
  });

  sinon
    .stub(paymentDibsHandler, "handleDibsPayment") // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .callsFake((payment, accessToken) => {
      if (!handleDibsPaymentValid) {
        return Promise.reject(new BlError("could not create dibs payment"));
      }
      return Promise.resolve(testPayment);
    });

  sinon.stub(orderStorage, "get").callsFake((id: string) => {
    if (id !== testOrder.id) {
      return Promise.reject(new BlError("not found").code(702));
    }

    return Promise.resolve(testOrder);
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const orderStorageUpdateStub = sinon
    .stub(orderStorage, "update") // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .callsFake((id: string, data: any) => {
      return Promise.resolve(testOrder);
    });

  sinon.stub(paymentValidator, "validate").callsFake(() => {
    if (!paymentValidated) {
      return Promise.reject(new BlError("could not validate payment"));
    }

    return Promise.resolve(true);
  });

  describe("#before()", () => {});

  describe("#after()", () => {
    it("should reject if ids is empty or undefined", () => {
      return expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        paymentPostHook.after([], testAccessToken),
      ).to.eventually.be.rejectedWith(
        BlError,
        /payments is empty or undefined/,
      );
    });

    it("should reject if accessToken is undefined", () => {
      return expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        paymentPostHook.after([testPayment], undefined),
      ).to.be.rejectedWith(BlError, /accessToken is undefined/);
    });

    it("should reject if paymentValidator.validate rejects", () => {
      paymentValidated = false;

      return expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        paymentPostHook.after([testPayment], testAccessToken),
      ).to.be.rejectedWith(BlError, /payment could not be validated/);
    });

    context('when paymentMethod is "dibs"', () => {
      beforeEach(() => {
        testPayment.method = "dibs";
      });

      it("should reject if paymentDibsHandler.handleDibsPayment rejects", () => {
        handleDibsPaymentValid = false;

        return expect(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          paymentPostHook.after([testPayment], testAccessToken),
        ).to.be.rejectedWith(BlError, /could not create dibs payment/);
      });
    });
  });
});
