import "mocha";

import { DeliveryModel } from "@backend/collections/delivery/delivery.model";
import { OrderModel } from "@backend/collections/order/order.model";
import { PaymentDibsHandler } from "@backend/collections/payment/helpers/dibs/payment-dibs-handler";
import { PaymentModel } from "@backend/collections/payment/payment.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { DibsEasyOrder } from "@backend/payment/dibs/dibs-easy-order/dibs-easy-order";
import { DibsPaymentService } from "@backend/payment/dibs/dibs-payment.service";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("PaymentDibsHandler", () => {
  const orderStorage = new BlDocumentStorage(OrderModel);
  const paymentStorage = new BlDocumentStorage(PaymentModel);
  const dibsPaymentService = new DibsPaymentService();
  const deliveryStorage = new BlDocumentStorage(DeliveryModel);
  const userDetailStorage = new BlDocumentStorage(UserDetailModel);

  const paymentDibsHandler = new PaymentDibsHandler(
    paymentStorage,
    orderStorage,
    dibsPaymentService,
    deliveryStorage,
    userDetailStorage,
  );

  describe("handleDibsPayment()", () => {
    let testOrder: Order;
    let testPayment: Payment;
    let paymentUpdated: boolean;
    let getPaymentIdConfirm: boolean;
    let testAccessToken: AccessToken;
    let testDibsEasyOrder: DibsEasyOrder;
    let getDibsEasyOrderConfirm: boolean;
    let testPaymentId: string;
    let orderUpdated: boolean;

    let testDelivery: Delivery;

    beforeEach(() => {
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

      testAccessToken = {
        iss: "",
        aud: "",
        iat: 0,
        exp: 0,
        sub: "user1",
        username: "",
        permission: "customer",
        details: "userDetails",
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

      testDelivery = {
        id: "delivery1",
        method: "bring",
        info: {
          branch: "branch1",
        },
        order: "order1",
        amount: 100,
      };

      orderUpdated = true;
      paymentUpdated = true;
      getPaymentIdConfirm = true;
      getDibsEasyOrderConfirm = true;
      testPaymentId = "dibsPaymentId1";
    });

    sinon.stub(dibsPaymentService, "orderToDibsEasyOrder").callsFake(() => {
      if (getDibsEasyOrderConfirm) return testDibsEasyOrder;
      throw new BlError("could not create dibs easy order");
    });

    sinon.stub(userDetailStorage, "get").callsFake(() => {
      return Promise.resolve({
        id: "customer1",
        name: "Billy Bob",
        email: "billy@boklisten.co",
      } as UserDetail);
    });

    sinon
      .stub(dibsPaymentService, "getPaymentId")

      .callsFake((dibsEasyOrder: DibsEasyOrder) => {
        return getPaymentIdConfirm
          ? Promise.resolve(testPaymentId)
          : Promise.reject(new BlError("could not create paymentId"));
      });

    sinon.stub(paymentStorage, "update").callsFake((id: string, data: any) => {
      if (!paymentUpdated) {
        return Promise.reject(new BlError("could not update payment"));
      }
      if (data["info"]) {
        testPayment.info = data["info"];
      }
      return Promise.resolve(testPayment);
    });

    sinon.stub(orderStorage, "get").callsFake((id: string) => {
      return id === testOrder.id
        ? Promise.resolve(testOrder)
        : Promise.reject(new BlError("order not found"));
    });

    sinon.stub(orderStorage, "update").callsFake((id: string, data: any) => {
      if (!orderUpdated) {
        return Promise.reject(new BlError("could not update"));
      }

      if (data["payments"]) {
        testOrder["payments"] = data["payments"];
      }

      return Promise.resolve(testOrder);
    });

    it("should reject if order is not found", () => {
      testPayment.order = "notFoundOrder";

      return expect(
        paymentDibsHandler.handleDibsPayment(testPayment),
      ).to.be.rejectedWith(BlError, /order not found/);
    });

    it("should reject if dibsPaymentService.orderToDibsEasyOrder rejects", () => {
      getDibsEasyOrderConfirm = false;

      return expect(
        paymentDibsHandler.handleDibsPayment(testPayment),
      ).to.be.rejectedWith(BlError, /could not create dibs easy order/);
    });

    it("should reject if dibs paymentId could not be created", () => {
      getPaymentIdConfirm = false;

      return expect(
        paymentDibsHandler.handleDibsPayment(testPayment),
      ).to.be.rejectedWith(BlError);
    });

    it("should resolve with a payment including the correct paymentId", (done) => {
      testPaymentId = "testDibsPaymentId1";

      paymentDibsHandler
        .handleDibsPayment(testPayment)
        .then((payment: Payment) => {
          // @ts-expect-error fixme: auto ignored
          expect(payment.info["paymentId"]).to.eql(testPaymentId);
          done();
        });
    });
  });
});
