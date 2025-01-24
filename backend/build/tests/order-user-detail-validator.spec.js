import { OrderUserDetailValidator } from "@backend/lib/collections/order/helpers/order-validator/order-user-detail-validator/order-user-detail-validator.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();
test.group("OrderUserDetailValidator", (group) => {
    const orderUserDetailValidator = new OrderUserDetailValidator();
    let testOrder;
    let testUserDetail;
    let sandbox;
    group.each.setup(() => {
        testOrder = {
            id: "order1",
            customer: "userDetail1",
        };
        testUserDetail = {
            id: "userDetail1",
            emailConfirmed: true,
        };
        sandbox = createSandbox();
        sandbox.stub(BlStorage.UserDetails, "get").callsFake((id) => {
            if (id !== testUserDetail.id) {
                return Promise.reject(new BlError("could not get userDetail"));
            }
            return Promise.resolve(testUserDetail);
        });
    });
    group.each.teardown(() => {
        sandbox.restore();
    });
    test("should reject if userDetail is not found", async () => {
        testOrder.customer = "notFound";
        orderUserDetailValidator.validate(testOrder).catch(async (err) => {
            // @ts-expect-error fixme: auto ignored
            return expect(err.errorStack[0].getMsg()).to.be.eq("could not get userDetail");
        });
    });
    test("should resolve if userDetail is valid", async () => {
        return expect(orderUserDetailValidator.validate(testOrder)).to.be.fulfilled;
    });
});
