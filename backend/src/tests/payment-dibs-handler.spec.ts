import { PaymentDibsHandler } from "@backend/express/collections/payment/helpers/dibs/payment-dibs-handler.js";
import { DibsEasyOrder } from "@backend/express/payment/dibs/dibs-easy-order.js";
import { DibsPaymentService } from "@backend/express/payment/dibs/dibs-payment.service.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Order } from "@shared/order/order.js";
import { Payment } from "@shared/payment/payment.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("PaymentDibsHandler", (group) => {
  const dibsPaymentService = new DibsPaymentService();

  const paymentDibsHandler = new PaymentDibsHandler(dibsPaymentService);

  let testOrder: Order;
  let testPayment: Payment;
  let paymentUpdated: boolean;
  let getPaymentIdConfirm: boolean;
  let testDibsEasyOrder: DibsEasyOrder;
  let getDibsEasyOrderConfirm: boolean;
  let testPaymentId: string;
  let orderUpdated: boolean;

  let sandbox: sinon.SinonSandbox;
  group.each.setup(() => {
    testOrder = {
      id: "order1",
      amount: 200,
      orderItems: [],
      branch: "branch1",
      customer: "customer1",
      byCustomer: true,
      pendingSignature: false,
    };

    testPayment = {
      id: "payment1",
      method: "dibs",
      order: "order1",
      amount: 200,
      customer: "customer1",
      branch: "branch1",
    };

    testDibsEasyOrder = {
      order: {
        reference: testOrder.id,
        items: [
          {
            reference: "item1",
            name: "Signatur 3",
            quantity: 1,
            unit: "book",
            unitPrice: 20000,
            taxRate: 0,
            taxAmount: 0,
            grossTotalAmount: 20000,
            netTotalAmount: 20000,
          },
        ],
        amount: 20000,
        currency: "NOK",
      },
      checkout: {
        url: "",
        termsUrl: "",
        ShippingCountries: [
          {
            countryCode: "NOR",
          },
        ],
      },
    };

    orderUpdated = true;
    paymentUpdated = true;
    getPaymentIdConfirm = true;
    getDibsEasyOrderConfirm = true;
    testPaymentId = "dibsPaymentId1";

    sandbox = createSandbox();
    sandbox.stub(dibsPaymentService, "orderToDibsEasyOrder").callsFake(() => {
      if (getDibsEasyOrderConfirm) return testDibsEasyOrder;
      throw new BlError("could not create dibs easy order");
    });

    sandbox.stub(BlStorage.UserDetails, "get").callsFake(() => {
      return Promise.resolve({
        id: "customer1",
        name: "Billy Bob",
        email: "billy@boklisten.co",
      } as UserDetail);
    });

    sandbox.stub(dibsPaymentService, "getPaymentId").callsFake(() => {
      return getPaymentIdConfirm
        ? Promise.resolve(testPaymentId)
        : Promise.reject(new BlError("could not create paymentId"));
    });

    sandbox.stub(BlStorage.Payments, "update").callsFake((id, data) => {
      if (!paymentUpdated) {
        return Promise.reject(new BlError("could not update payment"));
      }
      if (data["info"]) {
        testPayment.info = data["info"];
      }
      return Promise.resolve(testPayment);
    });

    sandbox.stub(BlStorage.Orders, "get").callsFake((id) => {
      return id === testOrder.id
        ? Promise.resolve(testOrder)
        : Promise.reject(new BlError("order not found"));
    });

    sandbox.stub(BlStorage.Orders, "update").callsFake((id, data) => {
      if (!orderUpdated) {
        return Promise.reject(new BlError("could not update"));
      }

      if (data["payments"]) {
        testOrder["payments"] = data["payments"];
      }

      return Promise.resolve(testOrder);
    });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if order is not found", async () => {
    testPayment.order = "notFoundOrder";

    return expect(
      paymentDibsHandler.handleDibsPayment(testPayment),
    ).to.be.rejectedWith(BlError, /order not found/);
  });

  test("should reject if dibsPaymentService.orderToDibsEasyOrder rejects", async () => {
    getDibsEasyOrderConfirm = false;

    return expect(
      paymentDibsHandler.handleDibsPayment(testPayment),
    ).to.be.rejectedWith(BlError, /could not create dibs easy order/);
  });

  test("should reject if dibs paymentId could not be created", async () => {
    getPaymentIdConfirm = false;

    return expect(
      paymentDibsHandler.handleDibsPayment(testPayment),
    ).to.be.rejectedWith(BlError);
  });

  test("should resolve with a payment including the correct paymentId", async () => {
    testPaymentId = "testDibsPaymentId1";

    paymentDibsHandler
      .handleDibsPayment(testPayment)
      .then((payment: Payment) => {
        // @ts-expect-error fixme: auto ignored
        return expect(payment.info["paymentId"]).to.eql(testPaymentId);
      });
  });
});
