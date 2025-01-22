import { OrderUserDetailValidator } from "@backend/collections/order/helpers/order-validator/order-user-detail-validator/order-user-detail-validator.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Order } from "@shared/order/order.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("OrderUserDetailValidator", (group) => {
  const orderUserDetailValidator = new OrderUserDetailValidator();
  let testOrder: Order;
  let testUserDetail: UserDetail;

  let sandbox: sinon.SinonSandbox;
  group.each.setup(() => {
    testOrder = {
      id: "order1",
      customer: "userDetail1",
    } as Order;

    testUserDetail = {
      id: "userDetail1",
      emailConfirmed: true,
    } as UserDetail;
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

    orderUserDetailValidator.validate(testOrder).catch(async (err: BlError) => {
      // @ts-expect-error fixme: auto ignored
      return expect(err.errorStack[0].getMsg()).to.be.eq(
        "could not get userDetail",
      );
    });
  });

  test("should resolve if userDetail is valid", async () => {
    return expect(orderUserDetailValidator.validate(testOrder)).to.be.fulfilled;
  });
});
