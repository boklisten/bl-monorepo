import "mocha";

import { DeliveryModel } from "@backend/collections/delivery/delivery.model";
import { OrderModel } from "@backend/collections/order/order.model";
import { PaymentValidator } from "@backend/collections/payment/helpers/payment.validator";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("PaymentValidator", () => {
  const orderStorage = new BlDocumentStorage(OrderModel);
  const deliveryStorage = new BlDocumentStorage(DeliveryModel);
  const paymentValidator = new PaymentValidator(orderStorage, deliveryStorage);

  let testPayment: Payment;
  let testOrder: Order;
  let testDelivery: Delivery;

  beforeEach(() => {
    testPayment = {
      id: "payment1",
      method: "dibs",
      order: "order1",
      info: {
        paymentId: "dibs1",
      },
      amount: 100,
      confirmed: false,
      customer: "customer1",
      branch: "branch1",
    };

    testOrder = {
      id: "order1",
      amount: 100,
      customer: "customer1",
      branch: "branch1",
      orderItems: [],
      byCustomer: true,
      pendingSignature: false,
    };

    testDelivery = {
      id: "delivery1",
      method: "bring",
      info: {
        amount: 100,
        estimatedDelivery: new Date(),
      },
      order: "order1",
      amount: 100,
    };
  });

  sinon.stub(orderStorage, "get").callsFake((id: string) => {
    if (id !== testOrder.id) {
      return Promise.reject(new BlError("order not found").code(702));
    }
    return Promise.resolve(testOrder);
  });

  sinon.stub(deliveryStorage, "get").callsFake((id: string) => {
    return id === testDelivery.id
      ? Promise.resolve(testDelivery)
      : Promise.reject(new BlError("delivery not found"));
  });

  describe("#validate()", () => {
    it("should reject if payment is undefined", () => {
      return expect(
        // @ts-expect-error fixme: auto ignored
        paymentValidator.validate(undefined),
      ).to.eventually.be.rejectedWith(BlError, /payment is not defined/);
    });

    it("should reject if paymentMethod is not valid", () => {
      testPayment.method = "something" as any;
      return expect(
        paymentValidator.validate(testPayment),
      ).to.eventually.be.rejectedWith(
        BlError,
        /payment.method "something" not supported/,
      );
    });

    it("should resolve when payment is valid", () => {
      return expect(paymentValidator.validate(testPayment)).to.eventually.be
        .fulfilled;
    });

    it("should reject if order is not found", () => {
      testPayment.order = "orderNotFound";

      return expect(paymentValidator.validate(testPayment)).to.be.rejectedWith(
        BlError,
        /order not found/,
      );
    });

    context('when paymentMethod is "dibs"', () => {});

    context('when paymentMethod is "card"', () => {});

    context("when order.delivery is set", () => {
      it("should reject if order.delivery is not found", () => {
        testOrder.delivery = "notFoundDelivery";

        return expect(
          paymentValidator.validate(testPayment),
        ).to.be.rejectedWith(BlError, /delivery not found/);
      });

      it("should reject if payment.amount is not equal to order.amount + delivery.amount", () => {
        testOrder.amount = 200;
        testPayment.amount = 200;
        testDelivery.amount = 100;
        testOrder.delivery = testDelivery.id;

        return expect(
          paymentValidator.validate(testPayment),
        ).to.be.rejectedWith(
          BlError,
          /payment.amount "200" is not equal to \(order.amount \+ delivery.amount\) "300"/,
        );
      });
    });

    context('when paymentMethod is "later"', () => {});
  });
});
