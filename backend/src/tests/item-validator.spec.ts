import { ItemValidator } from "@backend/collections/order/helpers/order-validator/item-validator/item-validator.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Item } from "@shared/item/item.js";
import { OrderItem } from "@shared/order/order-item/order-item.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("ItemValidator", () => {
  let testItem: Item;
  let testOrderItem: OrderItem;
  const itemValidator: ItemValidator = new ItemValidator();

  beforeEach(() => {
    testItem = {
      id: "i1",
      buyback: false,
      title: "Signatur 2",
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
      taxRate: 0,
      price: 100,
      creationTime: new Date(),
      lastUpdated: new Date(),
      active: true,
    };

    testOrderItem = {
      item: "i1",
      title: "signatur 3",
      unitPrice: 100,
      taxRate: 0,
      taxAmount: 0,
      amount: 100,
      type: "rent",
    };
  });

  describe("#validateWithOrderItem()", () => {
    it("should return true when using valid orderItem and valid item", () => {
      expect(itemValidator.validateItemInOrder(testItem, testOrderItem)).to.be
        .true;
    });

    it("should throw BlError when orderItem.item is not the same as item.id", () => {
      testItem.id = "notarealId";
      testOrderItem.item = "i4";

      expect(() => {
        itemValidator.validateItemInOrder(testItem, testOrderItem);
      }).to.throw(BlError);
    });

    it("should throw error when item.actve is false", () => {
      testItem.active = false;

      expect(() => {
        itemValidator.validateItemInOrder(testItem, testOrderItem);
      }).to.throw(BlError, /item.active is false/);
    });
  });
});
