import { CustomerItemModel } from "@backend/collections/customer-item/customer-item.model";
import { OrderToCustomerItemGenerator } from "@backend/collections/customer-item/helpers/order-to-customer-item-generator";
import { OrderPlacedHandler } from "@backend/collections/order/helpers/order-placed-handler/order-placed-handler";
import { OrderValidator } from "@backend/collections/order/helpers/order-validator/order-validator";
import { OrderPlaceOperation } from "@backend/collections/order/operations/place/order-place.operation";
import { OrderModel } from "@backend/collections/order/order.model";
import { SignatureModel } from "@backend/collections/signature/signature.model";
import { Signature } from "@backend/collections/signature/signature.model";
import { StandMatchModel } from "@backend/collections/stand-match/stand-match.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { UserMatchModel } from "@backend/collections/user-match/user-match.model";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { SIGNATURE_NUM_MONTHS_VALID } from "@shared/signature/serialized-signature";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import moment from "moment-timezone";
import sinon from "sinon";

import "mocha";

chaiUse(chaiAsPromised);
should();

describe("OrderPlaceOperation", () => {
  const resHandler = new SEResponseHandler();
  const orderStorage = new BlStorage(OrderModel);
  const orderToCustomerItemGenerator = new OrderToCustomerItemGenerator();
  const customerItemStorage = new BlStorage(CustomerItemModel);
  const userMatchStorage = new BlStorage(UserMatchModel);
  const standMatchStorage = new BlStorage(StandMatchModel);
  const userDetailStorage = new BlStorage(UserDetailModel);
  const signatureStorage = new BlStorage(SignatureModel);
  const orderPlacedHandler = new OrderPlacedHandler(
    orderStorage,
    undefined,
    userDetailStorage,
    undefined,
    undefined,
    undefined,
    signatureStorage,
  );
  const orderValidator = new OrderValidator();

  const orderPlaceOperation = new OrderPlaceOperation(
    resHandler,
    orderToCustomerItemGenerator,
    orderStorage,
    customerItemStorage,
    orderPlacedHandler,
    orderValidator,
    userDetailStorage,
    userMatchStorage,
    standMatchStorage,
  );

  const placeOrderStub = sinon.stub(orderPlacedHandler, "placeOrder");
  const sendResponseStub = sinon.stub(resHandler, "sendResponse");
  const getOrderStub = sinon.stub(orderStorage, "get");
  const getCustomerItemStub = sinon.stub(customerItemStorage, "get");
  const aggregateCustomerItemsStub = sinon.stub(
    customerItemStorage,
    "aggregate",
  );
  const getManyCustomerItemsStub = sinon.stub(customerItemStorage, "getMany");
  const generateCustomerItemStub = sinon.stub(
    orderToCustomerItemGenerator,
    "generate",
  );
  const validateOrderStub = sinon.stub(orderValidator, "validate");
  const getAllUserMatchesStub = sinon.stub(userMatchStorage, "getAll");
  const getAllStandMatchesStub = sinon.stub(standMatchStorage, "getAll");
  const getUserDetailStub = sinon.stub(userDetailStorage, "get");
  const getSignatureStub = sinon.stub(signatureStorage, "get");

  describe("run()", () => {
    beforeEach(() => {
      placeOrderStub.reset();
      sendResponseStub.reset();
      getOrderStub.reset();
      getCustomerItemStub.reset();
      getManyCustomerItemsStub.reset();
      aggregateCustomerItemsStub.reset();
      generateCustomerItemStub.reset();
      validateOrderStub.reset();
      getAllUserMatchesStub.reset();
      getAllStandMatchesStub.reset();
      getUserDetailStub.reset();
      getSignatureStub.reset();
    });

    const validOrder: Order = {
      id: "validOrder1",
      amount: 100,

      orderItems: [
        {
          type: "buy",
          item: "item1",
          title: "signatur 3",
          amount: 100,
          unitPrice: 100,
          blid: "blid1",
          taxRate: 0,
          taxAmount: 0,
          handout: true,
          info: {},
          delivered: false,
          customerItem: "customerItem1",
        },
      ],
      branch: "branch1",
      customer: "customer1",
      byCustomer: false,
      employee: "employee1",
      placed: false,
      payments: ["payment1"],
      delivery: "delivery1",
      pendingSignature: false,
    };

    const userDetailWithSignatures: UserDetail = {
      name: "",
      email: "",
      phone: "",
      address: "",
      postCode: "",
      postCity: "",
      country: "",
      dob: new Date(),
      branch: "",
      signatures: ["validSignature"],
      id: "customer1",
      blid: "",
    };

    const validSignature: Signature = {
      image: Buffer.from("test"),
      signingName: "",
      signedByGuardian: true,
      id: "validSignature",
      creationTime: moment()
        .subtract(SIGNATURE_NUM_MONTHS_VALID / 2, "months")
        .toDate(),
    };

    it("should reject if order is not found", () => {
      getOrderStub.rejects(new BlError('order "randomOrder" not found'));

      return expect(
        // @ts-expect-error fixme missing params
        orderPlaceOperation.run({ documentId: "randomOrder" }),
      ).to.eventually.be.rejectedWith(/order "randomOrder" not found/);
    });

    it("should reject if orderPlacedHandler.placeOrder rejects", () => {
      getOrderStub.resolves(validOrder);
      placeOrderStub.rejects(new BlError("order could not be placed"));
      getAllUserMatchesStub.resolves([]);
      getAllStandMatchesStub.resolves([]);
      getManyCustomerItemsStub.resolves([]);
      aggregateCustomerItemsStub.resolves([]);
      getUserDetailStub.resolves(userDetailWithSignatures);
      getSignatureStub.resolves(validSignature);

      return expect(
        // @ts-expect-error fixme missing params
        orderPlaceOperation.run({
          documentId: validOrder.id,
          user: { id: "user1", permission: "admin", details: "" },
        }),
      ).to.eventually.be.rejectedWith(/order could not be placed/);
    });

    it("should reject if orderValidator.validate rejects", () => {
      getOrderStub.resolves(validOrder);
      placeOrderStub.resolves({} as Order);
      validateOrderStub.rejects(new BlError("order not valid!"));
      getAllUserMatchesStub.resolves([]);
      getAllStandMatchesStub.resolves([]);
      getManyCustomerItemsStub.resolves([]);
      aggregateCustomerItemsStub.resolves([]);
      getSignatureStub.resolves(validSignature);
      getUserDetailStub.resolves(userDetailWithSignatures);

      return expect(
        // @ts-expect-error fixme missing params
        orderPlaceOperation.run({
          documentId: validOrder.id,
          user: { id: "user1", permission: "admin", details: "" },
        }),
      ).to.eventually.be.rejectedWith(/order not valid/);
    });

    it("should resolve if order is valid", async () => {
      getAllUserMatchesStub.resolves([]);
      getAllStandMatchesStub.resolves([]);
      getManyCustomerItemsStub.resolves([]);
      const order = {
        id: "validOrder1",
        customer: "customer1",
        amount: 100,
        orderItems: [
          {
            type: "buy",
            amount: 100,
          },
        ],
      } as Order;

      getOrderStub.resolves(order);
      generateCustomerItemStub.resolves([]);
      placeOrderStub.resolves(order);
      validateOrderStub.resolves(true);
      getSignatureStub.resolves(validSignature);
      getUserDetailStub.resolves(userDetailWithSignatures);

      // @ts-expect-error fixme missing params
      const result = await orderPlaceOperation.run({
        documentId: validOrder.id,
        user: { id: "user1", permission: "admin", details: "" },
      });

      expect(result).to.be.true;
    });
  });
});
