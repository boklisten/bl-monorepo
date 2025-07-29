import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import mongoose from "mongoose";
import sinon, { createSandbox } from "sinon";

import { CustomerItemHandler } from "#services/legacy/collections/customer-item/helpers/customer-item-handler";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error";
import { Branch } from "#shared/branch";
import { CustomerItem } from "#shared/customer-item/customer-item";
import { OrderItem } from "#shared/order/order-item/order-item";

chaiUse(chaiAsPromised);
should();

test.group("CustomerItemHandler", (group) => {
  const customerItemHandler = new CustomerItemHandler();

  let sandbox: sinon.SinonSandbox;
  let getCustomerItemStub: sinon.SinonStub;
  let getByQueryCustomerItemStub: sinon.SinonStub;
  let getBranchStub: sinon.SinonStub;

  group.each.setup(() => {
    sandbox = createSandbox();
    const customerItemsStub = {
      get: sandbox.stub(),
      getByQuery: sandbox.stub(),
    };
    const branchesStub = {
      get: sandbox.stub(),
    };

    sandbox.stub(BlStorage, "CustomerItems").value(customerItemsStub);
    sandbox.stub(BlStorage, "Branches").value(branchesStub);

    getCustomerItemStub = customerItemsStub.get;
    getByQueryCustomerItemStub = customerItemsStub.getByQuery;
    getBranchStub = branchesStub.get;
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if returned is true", async () => {
    const customerItem = {
      deadline: new Date(),
      handout: true,
      returned: true,
    } as CustomerItem;

    getCustomerItemStub.withArgs("customerItem1").resolves(customerItem);

    const orderItem = {} as OrderItem;

    return expect(
      customerItemHandler.extend(
        "customerItem1",
        orderItem,
        "branch1",
        "order1",
      ),
    ).to.be.rejectedWith(BlError, /can not extend when returned is true/);
  });

  test("should reject if orderItem.type is not extend", async () => {
    const customerItem = {
      deadline: new Date(),
      handout: true,
      returned: false,
    } as CustomerItem;

    getCustomerItemStub.withArgs("customerItem1").resolves(customerItem);

    const orderItem = {
      type: "rent",
    } as OrderItem;

    return expect(
      customerItemHandler.extend(
        "customerItem1",
        orderItem,
        "branch1",
        "order1",
      ),
    ).to.be.rejectedWith(BlError, /orderItem.type is not "extend"/);
  });

  test("should reject if branch does not have the extend period", async () => {
    const customerItem = {
      deadline: new Date(),
      handout: true,
      returned: false,
    } as CustomerItem;

    getCustomerItemStub.withArgs("customerItem1").resolves(customerItem);

    const orderItem = {
      type: "extend",
      info: {
        from: new Date(),
        to: new Date(),
        numberOfPeriods: 1,
        periodType: "year",
        customerItem: "customerItem1",
      },
    } as OrderItem;

    const branch = {
      paymentInfo: {
        extendPeriods: [
          {
            type: "semester",
            date: new Date(),
            maxNumberOfPeriods: 1,
            price: 100,
          },
        ],
      },
    } as Branch;

    getBranchStub.withArgs("branch1").resolves(branch);

    return expect(
      customerItemHandler.extend(
        "customerItem1",
        orderItem,
        "branch1",
        "order1",
      ),
    ).to.be.rejectedWith(
      BlError,
      /extend period "year" is not present on branch/,
    );
  });

  test('should reject if orderItem.type is not "buyout"', async () => {
    const orderItem = {
      type: "rent",
    } as OrderItem;
    return expect(
      customerItemHandler.buyout("customerItem1", "order1", orderItem),
    ).to.be.rejectedWith('orderItem.type is not "buyout"');
  });

  test('should reject if orderItem.type is not "return"', async () => {
    const orderItem = {
      type: "rent",
    } as OrderItem;
    return expect(
      customerItemHandler.return(
        "customerItem1",
        "order1",
        orderItem,
        "branch1",
        "employee1",
      ),
    ).to.be.rejectedWith('orderItem.type is not "return"');
  });

  test('should reject if orderItem.type is not "buyout"', async () => {
    const orderItem = {
      type: "rent",
    } as OrderItem;
    return expect(
      customerItemHandler.buyback("customerItem1", "order1", orderItem),
    ).to.be.rejectedWith('orderItem.type is not "buyback"');
  });

  test("should return emtpy array if there are no customerItems", async () => {
    getByQueryCustomerItemStub.onFirstCall().resolves([]);

    customerItemHandler
      .getNotReturned("5c33b6137eab87644f7e75e2", new Date(2012, 1, 1))
      .then((notReturnedCustomerItems) => {
        return expect(notReturnedCustomerItems).to.eql([]);
      });
  });

  test("should ask db with correct query", async () => {
    const expectedQuery = new SEDbQuery();

    const before = new Date(2018, 11, 18);
    const deadline = new Date(2018, 11, 20);
    const after = new Date(2018, 11, 22);

    expectedQuery.dateFilters = [
      {
        fieldName: "deadline",
        op: {
          $gt: before,
          $lt: after,
        },
      },
    ];

    expectedQuery.objectIdFilters = [
      {
        fieldName: "customer",
        value: [
          "5c33b6137eab87644f7e75e2",
          new mongoose.Types.ObjectId("5c33b6137eab87644f7e75e2"),
        ],
      },
    ];

    expectedQuery.booleanFilters = [
      { fieldName: "returned", value: false },
      { fieldName: "buyout", value: false },
    ];

    getByQueryCustomerItemStub.withArgs(expectedQuery).resolves([]);

    customerItemHandler
      .getNotReturned("5c33b6137eab87644f7e75e2", deadline)
      .then(() => {
        const queryArg = getByQueryCustomerItemStub.getCall(0).args[0];

        expect(queryArg.booleanFilters).to.be.eql(expectedQuery.booleanFilters);

        expect(queryArg.objectIdFilters).to.be.eql(
          expectedQuery.objectIdFilters,
        );
      });
  });

  test("should return customerItems not returned with the specified deadline", async () => {
    const customerItems = [
      {
        id: "1",
        item: "item1",
        deadline: new Date(2018, 11, 20),
        returned: false,
      },
      {
        id: "2",
        item: "item2",
        deadline: new Date(2018, 11, 20),
        returned: false,
      },
    ] as CustomerItem[];

    getByQueryCustomerItemStub.returns(
      new Promise((resolve) => resolve(customerItems)),
    );

    customerItemHandler
      .getNotReturned("5c33b6137eab87644f7e75e2", new Date(2018, 11, 20))
      .then((result) => {
        return expect(result).to.eql(customerItems);
      });
  });

  test("should reject if BlStorage.CustomerItems rejects", async () => {
    getByQueryCustomerItemStub.rejects(new BlError("someting wrong"));

    return expect(
      customerItemHandler.getNotReturned(
        "5c33b6137eab87644f7e75e2",
        new Date(),
      ),
    ).to.be.rejectedWith(BlError);
  });
});
