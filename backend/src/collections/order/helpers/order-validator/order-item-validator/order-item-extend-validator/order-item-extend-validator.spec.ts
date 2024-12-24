import "mocha";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { OrderItemExtendValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-extend-validator/order-item-extend-validator";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Order } from "@shared/order/order";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("OrderItemExtendValidator", () => {
  const customerItemStorage = new BlDocumentStorage<CustomerItem>(
    BlCollectionName.CustomerItems,
  );
  const orderItemExtendValidator = new OrderItemExtendValidator(
    customerItemStorage,
  );

  let testOrder: Order;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let testItem: Item;
  let testBranch: Branch;
  let testCustomerItem: CustomerItem;

  describe("validate()", () => {
    sinon.stub(customerItemStorage, "get").callsFake((id: string) => {
      if (id !== testCustomerItem.id) {
        return Promise.reject(new BlError("not found").code(702));
      }
      return Promise.resolve(testCustomerItem);
    });

    it('should reject if orderItem.type is not "extend"', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      testOrder.orderItems[0].type = "rent";
      return expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
      ).to.be.rejectedWith(BlError, /orderItem.type "rent" is not "extend"/);
    });

    it("should reject if orderItem.info.periodType is not allowed at branch", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      testOrder.orderItems[0].info["periodType"] = "year";
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      testBranch.paymentInfo.extendPeriods = [
        {
          type: "semester",
          price: 100,
          date: new Date(),
          maxNumberOfPeriods: 1,
        },
      ];

      return expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
      ).to.be.rejectedWith(
        BlError,
        /orderItem.info.periodType is "year" but it is not allowed by branch/,
      );
    });

    it("should reject if orderItem.info.numberOfPeriods is greater than the maxNumberOfPeriods on branch", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      testOrder.orderItems[0].info["numberOfPeriods"] = 3;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      testBranch.paymentInfo.extendPeriods = [
        {
          type: "semester",
          price: 100,
          date: new Date(),
          maxNumberOfPeriods: 1,
        },
      ];
    });

    it("should reject if orderItem.info is not defined", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      testOrder.orderItems[0].info = null;

      return expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
      ).to.be.rejectedWith(BlError, /orderItem.info is not defined/);
    });

    it("should reject if orderItem.customerItem is not defined", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      testOrder.orderItems[0].info.customerItem = null;

      return expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
      ).to.be.rejectedWith(
        BlError,
        /orderItem.info.customerItem is not defined/,
      );
    });

    it("should reject when customerItem have been extended to many times", () => {
      testCustomerItem.id = "maxExtendedCustomerItem";
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      testBranch.paymentInfo.extendPeriods = [
        {
          type: "semester",
          price: 100,
          date: new Date(),
          maxNumberOfPeriods: 1,
        },
      ];

      testCustomerItem.periodExtends = [
        {
          from: new Date(),
          to: new Date(),
          periodType: "semester",
          time: new Date(),
        },
        {
          from: new Date(),
          to: new Date(),
          periodType: "semester",
          time: new Date(),
        },
      ]; // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      testOrder.orderItems[0].info.customerItem = "maxExtendedCustomerItem";

      return expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        orderItemExtendValidator.validate(testBranch, testOrder.orderItems[0]),
      ).to.be.rejectedWith(
        BlError,
        /orderItem can not be extended any more times/,
      );
    });
  });

  beforeEach(() => {
    testCustomerItem = {
      id: "customerItem1",
      item: "item1",
      deadline: new Date(),
      handout: true,
      customer: "customer1",
      handoutInfo: {
        handoutBy: "branch",
        handoutById: "branch1",
        handoutEmployee: "employee1",
        time: new Date(),
      },
      returned: false,
      periodExtends: [
        {
          from: new Date(),
          to: new Date(),
          periodType: "year",
          time: new Date(),
        },
      ],
    };

    testOrder = {
      id: "order1",
      amount: 100,
      customer: "",
      orderItems: [
        {
          item: "item1",
          title: "Spinn",
          amount: 100,
          unitPrice: 100,
          taxAmount: 0,
          taxRate: 0,
          type: "extend",
          info: {
            from: new Date(),
            to: new Date(),
            numberOfPeriods: 1,
            periodType: "semester",
            customerItem: "customerItem1",
          },
        },
      ],
      delivery: "delivery1",
      branch: "branch1",
      byCustomer: true,
      pendingSignature: false,
    };

    testBranch = {
      id: "branch1",
      name: "Sonans",
      branchItems: [],
      paymentInfo: {
        responsible: false,
        rentPeriods: [
          {
            type: "semester",
            maxNumberOfPeriods: 2,
            date: new Date(),
            percentage: 0.5,
          },
        ],
        extendPeriods: [
          {
            type: "semester",
            maxNumberOfPeriods: 1,
            date: new Date(),
            price: 100,
          },
        ],
        buyout: {
          percentage: 0.5,
        },
        acceptedMethods: ["card"],
      },
    };

    testItem = {
      id: "item1",
      title: "Signatur 3",
      type: "book",
      price: 600,
      taxRate: 0,

      buyback: false,
      categories: [],
      digital: false,
      info: {
        isbn: 0,
        subject: "",
        year: 0,
        price: {},
        weight: "",
        distributor: "",
        discount: 0,
        publisher: "",
      },
    };
  });
});
