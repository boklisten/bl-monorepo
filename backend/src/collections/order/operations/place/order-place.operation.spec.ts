import { OrderToCustomerItemGenerator } from "@backend/collections/customer-item/helpers/order-to-customer-item-generator.js";
import { OrderPlacedHandler } from "@backend/collections/order/helpers/order-placed-handler/order-placed-handler.js";
import { OrderValidator } from "@backend/collections/order/helpers/order-validator/order-validator.js";
import { OrderPlaceOperation } from "@backend/collections/order/operations/place/order-place.operation.js";
import { SEResponseHandler } from "@backend/response/se.response.handler.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { Signature } from "@backend/storage/models/signature.model.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Order } from "@shared/order/order.js";
import { SIGNATURE_NUM_MONTHS_VALID } from "@shared/signature/serialized-signature.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import moment from "moment-timezone";
import sinon, { createSandbox } from "sinon";

import "mocha";

chaiUse(chaiAsPromised);
should();

describe("OrderPlaceOperation", () => {
  const resHandler = new SEResponseHandler();
  const orderToCustomerItemGenerator = new OrderToCustomerItemGenerator();
  const orderPlacedHandler = new OrderPlacedHandler(
    undefined,
    undefined,
    undefined,
    undefined,
  );
  const orderValidator = new OrderValidator();

  const orderPlaceOperation = new OrderPlaceOperation(
    resHandler,
    orderToCustomerItemGenerator,
    orderPlacedHandler,
    orderValidator,
  );

  let placeOrderStub: sinon.SinonStub;
  let sendResponseStub: sinon.SinonStub;
  let getOrderStub: sinon.SinonStub;
  let getCustomerItemStub: sinon.SinonStub;
  let aggregateCustomerItemsStub: sinon.SinonStub;
  let getManyCustomerItemsStub: sinon.SinonStub;
  let generateCustomerItemStub: sinon.SinonStub;
  let validateOrderStub: sinon.SinonStub;
  let getAllUserMatchesStub: sinon.SinonStub;
  let getAllStandMatchesStub: sinon.SinonStub;
  let getUserDetailStub: sinon.SinonStub;
  let getSignatureStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  describe("run()", () => {
    beforeEach(() => {
      sandbox = createSandbox();
      placeOrderStub = sandbox.stub(orderPlacedHandler, "placeOrder");
      sendResponseStub = sandbox.stub(resHandler, "sendResponse");
      getOrderStub = sandbox.stub(BlStorage.Orders, "get");
      getCustomerItemStub = sandbox.stub(BlStorage.CustomerItems, "get");
      aggregateCustomerItemsStub = sandbox.stub(
        BlStorage.CustomerItems,
        "aggregate",
      );
      getManyCustomerItemsStub = sandbox.stub(
        BlStorage.CustomerItems,
        "getMany",
      );
      generateCustomerItemStub = sandbox.stub(
        orderToCustomerItemGenerator,
        "generate",
      );
      validateOrderStub = sandbox.stub(orderValidator, "validate");
      getAllUserMatchesStub = sandbox.stub(BlStorage.UserMatches, "getAll");
      getAllStandMatchesStub = sandbox.stub(BlStorage.StandMatches, "getAll");
      getUserDetailStub = sandbox.stub(BlStorage.UserDetails, "get");
      getSignatureStub = sandbox.stub(BlStorage.Signatures, "get");
    });
    afterEach(() => {
      sandbox.restore();
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
