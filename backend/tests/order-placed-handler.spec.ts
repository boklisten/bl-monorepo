import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { CustomerItemHandler } from "#services/legacy/collections/customer-item/helpers/customer-item-handler";
import { OrderItemMovedFromOrderHandler } from "#services/legacy/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { OrderPlacedHandler } from "#services/legacy/collections/order/helpers/order-placed-handler/order-placed-handler";
import { PaymentHandler } from "#services/legacy/collections/payment/helpers/payment-handler";
import { OrderEmailHandler } from "#services/legacy/order_email_handler";
import { StorageService } from "#services/storage_service";
import { AccessToken } from "#shared/access-token";
import { BlError } from "#shared/bl-error";
import { Order } from "#shared/order/order";
import { Payment } from "#shared/payment/payment";
import { UserDetail } from "#shared/user-detail";

chaiUse(chaiAsPromised);
should();

test.group("OrderPlacedHandler", (group) => {
  let testOrder: Order;
  let testPayment: Payment;
  let paymentsConfirmed: boolean;
  let testAccessToken: AccessToken;
  let orderUpdate: boolean;
  let testUserDetail: UserDetail;
  let userDeatilUpdate: boolean;

  const paymentHandler = new PaymentHandler();
  const orderItemMovedFromOrderHandler = new OrderItemMovedFromOrderHandler();
  const customerItemHandler = new CustomerItemHandler();
  const orderPlacedHandler = new OrderPlacedHandler(
    paymentHandler,
    customerItemHandler,
    orderItemMovedFromOrderHandler,
  );

  let sandbox: sinon.SinonSandbox;
  group.each.setup(() => {
    sandbox = createSandbox();

    sandbox
      .stub(orderItemMovedFromOrderHandler, "updateOrderItems")
      .resolves(true);

    const customerItemsStub = {
      add: sandbox.stub().callsFake((customerItem) => {
        if (customerItem.item === "item1") {
          customerItem.id = "customerItem1";
          return Promise.resolve(customerItem);
        } else if (customerItem.item === "item2") {
          customerItem.id = "customerItem2";
          return Promise.resolve(customerItem);
        } else {
          return Promise.reject("could not add doc");
        }
      }),
    };
    sandbox.stub(StorageService, "CustomerItems").value(customerItemsStub);

    const userDetailsStub = {
      get: sandbox.stub().callsFake((id: string) => {
        if (id !== testUserDetail.id) {
          return Promise.reject(new BlError("user detail not found"));
        }
        return Promise.resolve(testUserDetail);
      }),
      update: sandbox.stub().callsFake((id, data) => {
        if (userDeatilUpdate) {
          if (data["orders"]) {
            testUserDetail.orders = data["orders"];
            return Promise.resolve(testUserDetail);
          }
        }
        return Promise.reject(new BlError("could not update user detail"));
      }),
    };
    sandbox.stub(StorageService, "UserDetails").value(userDetailsStub);

    sandbox.stub(paymentHandler, "confirmPayments").callsFake(() => {
      if (!paymentsConfirmed) {
        return Promise.reject(new BlError("could not confirm payments"));
      }

      return Promise.resolve([testPayment]);
    });

    // 5) Stub BlStorage.Orders as a single object
    const ordersStub = {
      update: sandbox.stub().callsFake(() => {
        if (!orderUpdate) {
          return Promise.reject(new BlError("could not update order"));
        }
        return Promise.resolve(testOrder);
      }),
      get: sandbox.stub().callsFake(() => {
        // If you need custom logic, do it here. Otherwise:
        return Promise.resolve(testOrder); // or whatever you need
      }),
    };
    sandbox.stub(StorageService, "Orders").value(ordersStub);

    sandbox.stub(OrderEmailHandler, "sendOrderReceipt").resolves();

    paymentsConfirmed = true;
    orderUpdate = true;
    userDeatilUpdate = true;

    testOrder = {
      id: "branch1",
      amount: 100,
      orderItems: [
        {
          type: "rent",
          item: "item2",
          title: "Signatur 3: Tekstsammling",
          amount: 50,
          unitPrice: 100,
          taxRate: 0.5,
          taxAmount: 25,
          info: {
            from: new Date(),
            to: new Date(),
            numberOfPeriods: 1,
            periodType: "semester",
          },
        },
      ],
      branch: "branch1",
      customer: "customer1",
      byCustomer: true,
      placed: true,
      payments: [],
      delivery: "delivery1",
      pendingSignature: false,
      notification: { email: false },
    };

    testPayment = {
      id: "payment1",
      method: "dibs",
      order: "order1",
      amount: 200,
      customer: "customer1",
      branch: "branch1",
      taxAmount: 0,
      info: {
        paymentId: "dibsEasyPayment1",
      },
    };

    testAccessToken = {
      iss: "boklisten.co",
      aud: "boklisten.co",
      iat: 1,
      exp: 1,
      sub: "userDetail1",
      permission: "customer",
      details: "userDetail1",
      username: "user@name.com",
    };

    testUserDetail = {
      id: "customer1",
      name: "",
      email: "",
      phone: "",
      address: "",
      postCode: "",
      postCity: "",
      dob: new Date(),
      emailConfirmed: true,
      signatures: [],
      blid: "",
    };
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if order could not be updated with confirm true", async () => {
    orderUpdate = false;

    orderPlacedHandler
      .placeOrder(testOrder, testAccessToken.details)
      .catch((err: BlError) => {
        // @ts-expect-error fixme: auto ignored
        return expect(err.errorStack[0].getMsg()).to.be.eq(
          "could not update order",
        );
      });
  });

  test("should reject if paymentHandler.confirmPayments rejects", async () => {
    paymentsConfirmed = false;

    orderPlacedHandler
      .placeOrder(testOrder, testAccessToken.details)
      .catch((err: BlError) => {
        // @ts-expect-error fixme: auto ignored
        return expect(err.errorStack[0].getMsg()).to.be.eq(
          "could not confirm payments",
        );
      });
  });

  test("should reject if order.customer is not found", async () => {
    testOrder.customer = "notFoundUserDetails";

    try {
      await orderPlacedHandler.placeOrder(testOrder, testAccessToken.details);
    } catch (e) {
      // @ts-expect-error fixme: auto ignored
      expect(e.errorStack[0].getMsg()).to.eq("user detail not found");
    }
  });

  test("should reject if userDetailStorage.updates rejects", async () => {
    userDeatilUpdate = false;

    orderPlacedHandler
      .placeOrder(testOrder, testAccessToken.details)
      .catch((err: BlError) => {
        // @ts-expect-error fixme: auto ignored
        return expect(err.errorStack[0].getMsg()).to.be.eq(
          "could not update userDetail with placed order",
        );
      });
  });

  //test('should reject if userDetail.emailConfirmed is false', async () => {
  //testUserDetail.emailConfirmed = false;

  //orderPlacedHandler.placeOrder(testOrder, testAccessToken).catch((err: BlError) => {
  //return expect( err.errorStack[0].getMsg())
  //.to.be.eq('userDetail.emailConfirmed is not true');
  //
  //})
  /*});*/

  test("should resolve when order was placed", async () => {
    return expect(
      orderPlacedHandler.placeOrder(testOrder, testAccessToken.details),
    ).to.be.fulfilled;
  });
});
