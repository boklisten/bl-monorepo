import "mocha";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { OrderUserDetailValidator } from "@backend/collections/order/helpers/order-validator/order-user-detail-validator/order-user-detail-validator";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("OrderUserDetailValidator", () => {
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const orderUserDetailValidator = new OrderUserDetailValidator(
    userDetailStorage,
  );
  let testOrder: Order;
  let testUserDetail: UserDetail;

  beforeEach(() => {
    testOrder = {
      id: "order1",
      customer: "userDetail1",
    } as Order;

    testUserDetail = {
      id: "userDetail1",
      emailConfirmed: true,
    } as UserDetail;
  });

  sinon.stub(userDetailStorage, "get").callsFake((id: string) => {
    if (id !== testUserDetail.id) {
      return Promise.reject(new BlError("could not get userDetail"));
    }

    return Promise.resolve(testUserDetail);
  });

  describe("#validate", () => {
    it("should reject if userDetail is not found", (done) => {
      testOrder.customer = "notFound";

      orderUserDetailValidator.validate(testOrder).catch((err: BlError) => {
        // @ts-expect-error fixme: auto ignored
        expect(err.errorStack[0].getMsg()).to.be.eq("could not get userDetail");
        done();
      });
    });

    it("should resolve if userDetail is valid", () => {
      return expect(orderUserDetailValidator.validate(testOrder)).to.be
        .fulfilled;
    });
  });
});
