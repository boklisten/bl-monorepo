import { BlCollectionName } from "@backend/collections/bl-collection";
import { OrderToCustomerItemGenerator } from "@backend/collections/customer-item/helpers/order-to-customer-item-generator";
import { OrderPlacedHandler } from "@backend/collections/order/helpers/order-placed-handler/order-placed-handler";
import { OrderValidator } from "@backend/collections/order/helpers/order-validator/order-validator";
import { OrderPlaceOperation } from "@backend/collections/order/operations/place/order-place.operation";
import { Signature } from "@backend/collections/signature/signature.schema";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Match } from "@shared/match/match";
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
  const orderStorage = new BlDocumentStorage<Order>(BlCollectionName.Orders);
  const orderToCustomerItemGenerator = new OrderToCustomerItemGenerator();
  const customerItemStorage = new BlDocumentStorage<CustomerItem>(
    BlCollectionName.CustomerItems,
  );
  const matchesStorage = new BlDocumentStorage<Match>(BlCollectionName.Matches);
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const signatureStorage = new BlDocumentStorage<Signature>(
    BlCollectionName.Signatures,
  );
  const orderPlacedHandler = new OrderPlacedHandler(
    undefined,
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
    matchesStorage,
  );

  const placeOrderStub = sinon.stub(orderPlacedHandler, "placeOrder");
  const sendResponseStub = sinon.stub(resHandler, "sendResponse");
  const getOrderStub = sinon.stub(orderStorage, "get");
  const getCustomerItemStub = sinon.stub(customerItemStorage, "get");
  const getManyCustomerItemsStub = sinon.stub(customerItemStorage, "getMany");
  const generateCustomerItemStub = sinon.stub(
    orderToCustomerItemGenerator,
    "generate",
  );
  const validateOrderStub = sinon.stub(orderValidator, "validate");
  const getAllMatchesStub = sinon.stub(matchesStorage, "getAll");
  const getUserDetailStub = sinon.stub(userDetailStorage, "get");
  const getSignatureStub = sinon.stub(signatureStorage, "get");

  describe("run()", () => {
    beforeEach(() => {
      placeOrderStub.reset();
      sendResponseStub.reset();
      getOrderStub.reset();
      getCustomerItemStub.reset();
      getManyCustomerItemsStub.reset();
      generateCustomerItemStub.reset();
      validateOrderStub.reset();
      getAllMatchesStub.reset();
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
          age: "new",
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
        orderPlaceOperation.run({ documentId: "randomOrder" }),
      ).to.eventually.be.rejectedWith(/order "randomOrder" not found/);
    });

    it("should reject if orderPlacedHandler.placeOrder rejects", () => {
      getOrderStub.resolves(validOrder);
      placeOrderStub.rejects(new BlError("order could not be placed"));
      getAllMatchesStub.resolves([]);
      getManyCustomerItemsStub.resolves([]);
      getUserDetailStub.resolves(userDetailWithSignatures);
      getSignatureStub.resolves(validSignature);

      return expect(
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
      getAllMatchesStub.resolves([]);
      getManyCustomerItemsStub.resolves([]);
      getSignatureStub.resolves(validSignature);
      getUserDetailStub.resolves(userDetailWithSignatures);

      return expect(
        orderPlaceOperation.run({
          documentId: validOrder.id,
          user: { id: "user1", permission: "admin", details: "" },
        }),
      ).to.eventually.be.rejectedWith(/order not valid/);
    });

    it("should resolve if order is valid", async () => {
      getAllMatchesStub.resolves([]);
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

      const result = await orderPlaceOperation.run({
        documentId: validOrder.id,
        user: { id: "user1", permission: "admin", details: "" },
      });

      expect(result).to.be.true;
    });
  });
});
