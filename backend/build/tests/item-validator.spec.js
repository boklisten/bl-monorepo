import { ItemValidator } from "@backend/lib/collections/order/helpers/order-validator/item-validator/item-validator.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
chaiUse(chaiAsPromised);
should();
test.group("ItemValidator", (group) => {
    let testItem;
    let testOrderItem;
    const itemValidator = new ItemValidator();
    group.each.setup(() => {
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
    test("should return true when using valid orderItem and valid item", async () => {
        expect(itemValidator.validateItemInOrder(testItem, testOrderItem)).to.be
            .true;
    });
    test("should throw BlError when orderItem.item is not the same as item.id", async () => {
        testItem.id = "notarealId";
        testOrderItem.item = "i4";
        expect(() => {
            itemValidator.validateItemInOrder(testItem, testOrderItem);
        }).to.throw(BlError);
    });
    test("should throw error when item.actve is false", async () => {
        testItem.active = false;
        expect(() => {
            itemValidator.validateItemInOrder(testItem, testOrderItem);
        }).to.throw(BlError, /item.active is false/);
    });
});
