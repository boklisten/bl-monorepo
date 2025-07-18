import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import moment from "moment-timezone";
import sinon, { createSandbox } from "sinon";

import { Signature } from "#models/signature.schema";
import { OrderToCustomerItemGenerator } from "#services/collections/customer-item/helpers/order-to-customer-item-generator";
import { OrderPlacedHandler } from "#services/collections/order/helpers/order-placed-handler/order-placed-handler";
import { OrderValidator } from "#services/collections/order/helpers/order-validator/order-validator";
import { OrderPlaceOperation } from "#services/collections/order/operations/place/order-place.operation";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { Order } from "#shared/order/order";
import { SIGNATURE_NUM_MONTHS_VALID } from "#shared/signature/serialized-signature";
import { UserDetail } from "#shared/user/user-detail/user-detail";

chaiUse(chaiAsPromised);
should();

test.group("OrderPlaceOperation", (group) => {
  const orderToCustomerItemGenerator = new OrderToCustomerItemGenerator();
  const orderPlacedHandler = new OrderPlacedHandler();
  const orderValidator = new OrderValidator();

  const orderPlaceOperation = new OrderPlaceOperation(
    orderToCustomerItemGenerator,
    orderPlacedHandler,
    orderValidator,
  );

  let placeOrderStub: sinon.SinonStub;
  let getOrderStub: sinon.SinonStub;
  let aggregateCustomerItemsStub: sinon.SinonStub;
  let getManyCustomerItemsStub: sinon.SinonStub;
  let generateCustomerItemStub: sinon.SinonStub;
  let validateOrderStub: sinon.SinonStub;
  let getAllUserMatchesStub: sinon.SinonStub;
  let getAllStandMatchesStub: sinon.SinonStub;
  let getUserDetailStub: sinon.SinonStub;
  let getSignatureStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    placeOrderStub = sandbox.stub(orderPlacedHandler, "placeOrder");
    getOrderStub = sandbox.stub(BlStorage.Orders, "get");
    sandbox.stub(BlStorage.CustomerItems, "get");
    aggregateCustomerItemsStub = sandbox.stub(
      BlStorage.CustomerItems,
      "aggregate",
    );
    getManyCustomerItemsStub = sandbox.stub(BlStorage.CustomerItems, "getMany");
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
  group.each.teardown(() => {
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
    dob: new Date(),
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

  test("should reject if order is not found", async () => {
    getOrderStub.rejects(new BlError('order "randomOrder" not found'));

    return expect(
      orderPlaceOperation.run({ documentId: "randomOrder" }),
    ).to.eventually.be.rejectedWith(/order "randomOrder" not found/);
  });

  test("should reject if orderPlacedHandler.placeOrder rejects", async ({
    assert,
  }) => {
    getOrderStub.resolves(validOrder);
    placeOrderStub.rejects(new BlError("order could not be placed"));
    getAllUserMatchesStub.resolves([]);
    getAllStandMatchesStub.resolves([]);
    getManyCustomerItemsStub.resolves([]);
    aggregateCustomerItemsStub.resolves([]);
    getUserDetailStub.resolves(userDetailWithSignatures);
    getSignatureStub.resolves(validSignature);

    await assert.rejects(() =>
      orderPlaceOperation.run({
        documentId: validOrder.id,
        user: { id: "user1", permission: "admin", details: "" },
      }),
    );
  });

  test("should reject if orderValidator.validate rejects", async () => {
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
      orderPlaceOperation.run({
        documentId: validOrder.id,
        user: { id: "user1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejected;
  });

  test("should resolve if order is valid", async ({ assert }) => {
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

    const result = await orderPlaceOperation.run({
      documentId: validOrder.id,
      user: { id: "user1", permission: "admin", details: "" },
    });

    assert.deepEqual(result, new BlapiResponse([order]));
  });
});
