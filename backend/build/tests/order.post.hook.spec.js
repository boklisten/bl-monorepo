import { OrderValidator } from "@backend/lib/collections/order/helpers/order-validator/order-validator.js";
import { OrderHookBefore } from "@backend/lib/collections/order/hooks/order-hook-before.js";
import { OrderPostHook } from "@backend/lib/collections/order/hooks/order.post.hook.js";
import { UserDetailHelper } from "@backend/lib/collections/user-detail/helpers/user-detail.helper.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();
test.group("OrderPostHook", (group) => {
    const orderValidator = new OrderValidator();
    const userDetailHelper = new UserDetailHelper();
    const orderHookBefore = new OrderHookBefore();
    const orderPostHook = new OrderPostHook(orderValidator, orderHookBefore, userDetailHelper);
    let testOrder;
    let testAccessToken;
    let orderValidated;
    let sandbox;
    group.each.setup(() => {
        testAccessToken = {
            iss: "boklisten.co",
            aud: "boklisten.co",
            iat: 123,
            exp: 123,
            sub: "user1",
            username: "b@a.com",
            permission: "customer",
            details: "user1",
        };
        orderValidated = true;
        testOrder = {
            id: "order1",
            customer: "customer1",
            amount: 400,
            orderItems: [
                {
                    type: "buy",
                    amount: 300,
                    item: "i1",
                    title: "signatur",
                    taxRate: 0,
                    taxAmount: 0,
                    unitPrice: 300,
                },
                {
                    type: "rent",
                    amount: 100,
                    item: "i1",
                    title: "signatur",
                    taxRate: 0,
                    taxAmount: 0,
                    unitPrice: 300,
                },
            ],
            branch: "b1",
            byCustomer: true,
            payments: [],
            delivery: "",
            active: false,
            user: {
                id: "u1",
            },
            lastUpdated: new Date(),
            creationTime: new Date(),
            pendingSignature: false,
        };
        sandbox = createSandbox();
        sandbox.stub(orderValidator, "validate").callsFake(async () => {
            if (orderValidated) {
                return true;
            }
            throw new BlError("not a valid order");
        });
        sandbox.stub(BlStorage.Orders, "get").callsFake((orderId) => {
            if (orderId !== "order1" && orderId !== "orderValid") {
                return Promise.reject(new BlError("not found").code(702));
            }
            return Promise.resolve(testOrder);
        });
        sandbox.stub(orderHookBefore, "validate").callsFake((requestBody) => {
            return new Promise((resolve, reject) => {
                if (!requestBody["valid"]) {
                    return reject(new BlError("not a valid order").code(701));
                }
                resolve(true);
            });
        });
    });
    group.each.teardown(() => {
        sandbox.restore();
    });
    test("should reject if requestBody is not valid", async () => {
        return expect(orderPostHook.before({ valid: false }, testAccessToken)).to.eventually.be.rejectedWith(BlError, /not a valid order/);
    });
    test("should resolve if requestBody is valid", async () => {
        return expect(orderHookBefore.validate({ valid: true })).to.eventually.be
            .fulfilled;
    });
    test("should reject if accessToken is empty or undefined", async () => {
        orderPostHook.after([testOrder]).catch((blError) => {
            return expect(blError.getMsg()).to.contain("accessToken was not specified when trying to process order");
        });
    });
    test("should reject if orderValidator.validate rejected with error", async () => {
        orderValidated = false;
        testOrder.id = "order1";
        return expect(orderPostHook.after([testOrder], testAccessToken)).to.eventually.be.rejectedWith(BlError, /not a valid order/);
    });
    test("should resolve with testOrder when orderValidator.validate is resolved", async () => {
        orderValidated = true;
        testOrder.id = "order1";
        orderPostHook
            .after([testOrder], testAccessToken)
            .then((orders) => {
            expect(orders.length).to.be.eql(1);
            return expect(orders[0]).to.eql(testOrder);
        });
    });
    test("should reject if order.placed is set to true", async () => {
        testOrder.placed = true;
        return expect(orderPostHook.after([testOrder], testAccessToken)).to.be.rejectedWith(BlError, /order.placed is set to true on post of order/);
    });
});
