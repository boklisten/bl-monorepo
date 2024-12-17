import "mocha";
import { Item, Branch, Order } from "@boklisten/bl-model";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { BlCollectionName } from "@/collections/bl-collection";
import { OrderItemRentValidator } from "@/collections/order/helpers/order-validator/order-item-validator/order-item-rent-validator/order-item-rent-validator";
import { PriceService } from "@/price/price.service";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

chai.use(chaiAsPromised);

describe("OrderItemRentValidator", () => {
  const orderStorage = new BlDocumentStorage<Order>(BlCollectionName.Orders);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const orderItemRentValidator = new OrderItemRentValidator(orderStorage);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const priceService = new PriceService({ roundDown: true });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let testOrder: Order;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let testItem: Item;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let testBranch: Branch;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const orderStorageGetStub = sinon
    .stub(orderStorage, "get")
    .callsFake(() => Promise.resolve({} as Order));

  beforeEach(() => {
    testOrder = {
      id: "order1",
      amount: 300,
      customer: "",
      orderItems: [
        {
          item: "item1",
          title: "Spinn",
          amount: 300,
          unitPrice: 600,
          taxAmount: 0,
          taxRate: 0,
          type: "rent",
          info: {
            from: new Date(),
            to: new Date(),
            numberOfPeriods: 1,
            periodType: "semester",
          },
        },
      ],
      delivery: "delivery1",
      branch: "branch1",
      byCustomer: true,
      payments: ["payment1"],
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
            date: new Date(),
            maxNumberOfPeriods: 2,
            percentage: 0.5,
          },
        ],
        extendPeriods: [
          {
            type: "semester",
            price: 100,
            date: new Date(),
            maxNumberOfPeriods: 1,
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

  describe("validate()", () => {});
});
