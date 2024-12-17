import "mocha";
import {
  BlError,
  Order,
  CustomerItem,
  Payment,
  AccessToken,
  UserDetail,
} from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { BlCollectionName } from "@/collections/bl-collection";
import { CustomerItemHandler } from "@/collections/customer-item/helpers/customer-item-handler";
import { OrderItemMovedFromOrderHandler } from "@/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { OrderPlacedHandler } from "@/collections/order/helpers/order-placed-handler/order-placed-handler";
import { PaymentHandler } from "@/collections/payment/helpers/payment-handler";
import { Messenger } from "@/messenger/messenger";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

chai.use(chaiAsPromised);

describe("OrderPlacedHandler", () => {
  let testOrder: Order;
  let testPayment: Payment;
  let paymentsConfirmed: boolean;
  let testAccessToken: AccessToken;
  let orderUpdate: boolean;
  let testUserDetail: UserDetail;
  let userDeatilUpdate: boolean;

  const customerItemStorage = new BlDocumentStorage<CustomerItem>(
    BlCollectionName.CustomerItems,
  );
  const orderStorage = new BlDocumentStorage<Order>(BlCollectionName.Orders);
  const paymentHandler = new PaymentHandler();
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const messenger = new Messenger();
  const orderItemMovedFromOrderHandler = new OrderItemMovedFromOrderHandler();
  const customerItemHandler = new CustomerItemHandler();
  const orderPlacedHandler = new OrderPlacedHandler(
    customerItemStorage,
    orderStorage,
    paymentHandler,
    userDetailStorage,
    messenger,
    customerItemHandler,
    orderItemMovedFromOrderHandler,
  );

  sinon.stub(orderItemMovedFromOrderHandler, "updateOrderItems").resolves(true);

  sinon
    .stub(customerItemStorage, "add")
    .callsFake((customerItem: CustomerItem) => {
      if (customerItem.item === "item1") {
        customerItem.id = "customerItem1";
        return Promise.resolve(customerItem);
      } else if (customerItem.item === "item2") {
        customerItem.id = "customerItem2";
        return Promise.resolve(customerItem);
      } else {
        return Promise.reject("could not add doc");
      }
    });

  sinon.stub(userDetailStorage, "get").callsFake((id: string) => {
    if (id !== testUserDetail.id) {
      return Promise.reject(new BlError("user detail not found"));
    }

    return Promise.resolve(testUserDetail);
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sinon.stub(userDetailStorage, "update").callsFake((id: string, data: any) => {
    if (userDeatilUpdate) {
      if (data["orders"]) {
        testUserDetail.orders = data["orders"];
        return Promise.resolve(testUserDetail);
      }
    }
    return Promise.reject(new BlError("could not update user detail"));
  });

  sinon.stub(paymentHandler, "confirmPayments").callsFake(() => {
    if (!paymentsConfirmed) {
      return Promise.reject(new BlError("could not confirm payments"));
    }

    return Promise.resolve([testPayment]);
  });

  sinon.stub(orderStorage, "update").callsFake(() => {
    if (!orderUpdate) {
      return Promise.reject(new BlError("could not update order"));
    }
    return Promise.resolve(testOrder);
  });

  sinon.stub(orderStorage, "get");

  sinon.stub(messenger, "orderPlaced").resolves();

  beforeEach(() => {
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
      country: "",
      dob: new Date(),
      emailConfirmed: true,
      branch: "branch1",
      signatures: [],
    };
  });

  describe("#placeOrder()", () => {
    it("should reject if order could not be updated with confirm true", (done) => {
      orderUpdate = false;

      orderPlacedHandler
        .placeOrder(testOrder, testAccessToken)
        .catch((err: BlError) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          expect(err.errorStack[0].getMsg()).to.be.eq("could not update order");

          done();
        });
    });

    it("should reject if paymentHandler.confirmPayments rejects", (done) => {
      paymentsConfirmed = false;

      orderPlacedHandler
        .placeOrder(testOrder, testAccessToken)
        .catch((err: BlError) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          expect(err.errorStack[0].getMsg()).to.be.eq(
            "could not confirm payments",
          );
          done();
        });
    });

    it("should reject if order.customer is not found", async () => {
      testOrder.customer = "notFoundUserDetails";

      try {
        return await orderPlacedHandler.placeOrder(testOrder, testAccessToken);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return expect(e.errorStack[0].getMsg()).to.eq("user detail not found");
      }
    });

    it("should reject if userDetailStorage.updates rejects", (done) => {
      userDeatilUpdate = false;

      orderPlacedHandler
        .placeOrder(testOrder, testAccessToken)
        .catch((err: BlError) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          expect(err.errorStack[0].getMsg()).to.be.eq(
            "could not update userDetail with placed order",
          );
          done();
        });
    });

    //it('should reject if userDetail.emailConfirmed is false', (done) => {
    //testUserDetail.emailConfirmed = false;

    //orderPlacedHandler.placeOrder(testOrder, testAccessToken).catch((err: BlError) => {
    //expect(err.errorStack[0].getMsg())
    //.to.be.eq('userDetail.emailConfirmed is not true');
    //done();
    //})
    /*});*/

    it("should resolve when order was placed", () => {
      return expect(orderPlacedHandler.placeOrder(testOrder, testAccessToken))
        .to.be.fulfilled;
    });
  });
});
