import { PaymentValidator } from "@backend/express/collections/payment/helpers/payment.validator.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Delivery } from "@shared/delivery/delivery.js";
import { Order } from "@shared/order/order.js";
import { Payment } from "@shared/payment/payment.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("PaymentValidator", (group) => {
  const paymentValidator = new PaymentValidator();
  let testPayment: Payment;
  let testOrder: Order;
  let testDelivery: Delivery;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
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

    sandbox = createSandbox();
    sandbox.stub(BlStorage.Orders, "get").callsFake((id) => {
      if (id !== testOrder.id) {
        return Promise.reject(new BlError("order not found").code(702));
      }
      return Promise.resolve(testOrder);
    });

    sandbox.stub(BlStorage.Deliveries, "get").callsFake((id) => {
      return id === testDelivery.id
        ? Promise.resolve(testDelivery)
        : Promise.reject(new BlError("delivery not found"));
    });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("validate() - should reject if payment is undefined", async () => {
    return expect(
      // @ts-expect-error fixme: auto ignored
      paymentValidator.validate(undefined),
    ).to.eventually.be.rejectedWith(BlError, /payment is not defined/);
  });

  test("validate() - should reject if paymentMethod is not valid", async () => {
    return expect(
      paymentValidator.validate(
        JSON.parse(
          JSON.stringify({ method: "something", order: testOrder.id }),
        ),
      ),
    ).to.eventually.be.rejectedWith(
      BlError,
      'payment.method "something" not supported',
    );
  });

  test("validate() - should resolve when payment is valid", async () => {
    return expect(paymentValidator.validate(testPayment)).to.eventually.be
      .fulfilled;
  });

  test("validate() - should reject if order is not found", async () => {
    testPayment.order = "orderNotFound";

    return expect(paymentValidator.validate(testPayment)).to.be.rejectedWith(
      BlError,
      /order not found/,
    );
  });

  test("validate() - should reject if order.delivery is not found", async () => {
    testOrder.delivery = "notFoundDelivery";

    return expect(paymentValidator.validate(testPayment)).to.be.rejectedWith(
      BlError,
      /delivery not found/,
    );
  });

  test("validate() - should reject if payment.amount is not equal to order.amount + delivery.amount", async () => {
    testOrder.amount = 200;
    testPayment.amount = 200;
    testDelivery.amount = 100;
    testOrder.delivery = testDelivery.id;

    return expect(paymentValidator.validate(testPayment)).to.be.rejectedWith(
      BlError,
      /payment.amount "200" is not equal to \(order.amount \+ delivery.amount\) "300"/,
    );
  });
});
