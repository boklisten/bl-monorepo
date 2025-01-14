import "mocha";

import { CustomerItemModel } from "@backend/collections/customer-item/customer-item.model";
import { InvoiceModel } from "@backend/collections/invoice/invoice.model";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { LocalLoginModel } from "@backend/collections/local-login/local-login.model";
import { OrderModel } from "@backend/collections/order/order.model";
import { PaymentModel } from "@backend/collections/payment/payment.model";
import { User } from "@backend/collections/user/user";
import { UserModel } from "@backend/collections/user/user.model";
import { DeleteUserService } from "@backend/collections/user-detail/helpers/delete-user-service";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Invoice } from "@shared/invoice/invoice";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
chaiUse(chaiAsPromised);
should();

describe("UserDeleteAllInfo", () => {
  const localLoginStorage = new BlDocumentStorage(LocalLoginModel);
  const userStorage = new BlDocumentStorage(UserModel);
  const userDetailStorage = new BlDocumentStorage(UserDetailModel);
  const customerItemStorage = new BlDocumentStorage(CustomerItemModel);
  const invoiceStorage = new BlDocumentStorage(InvoiceModel);
  const orderStorage = new BlDocumentStorage(OrderModel);
  const paymentStorage = new BlDocumentStorage(PaymentModel);

  const localLoginRemoveStub = sinon.stub(localLoginStorage, "remove");
  const localLoginGetByQueryStub = sinon.stub(localLoginStorage, "getByQuery");
  const userRemoveStub = sinon.stub(userStorage, "remove");
  const userGetByQueryStub = sinon.stub(userStorage, "getByQuery");
  const userDetailGetStub = sinon.stub(userDetailStorage, "get");

  const userDeleteAllInfo = new DeleteUserService(
    userStorage,
    userDetailStorage,
    localLoginStorage,
    customerItemStorage,
    invoiceStorage,
    orderStorage,
    paymentStorage,
  );

  beforeEach(() => {
    localLoginRemoveStub.reset();
    userRemoveStub.reset();
    userGetByQueryStub.reset();
    userDetailGetStub.reset();
    localLoginGetByQueryStub.reset();
  });

  describe("deleteAllInfo()", () => {
    it("should call userStorage.remove with correct data", async () => {
      const userIdToRemove = "5daf2cf19f92d901e41c10d4";
      const userDetailIdToRemove = "5daf2cf19f92d901e41c10d6";
      const localLoginIdToRemove = "5daf2cf19f92d901e41c10ff";

      userRemoveStub.resolves({} as User);
      localLoginRemoveStub.resolves({} as LocalLogin);

      userGetByQueryStub.resolves([
        { id: userIdToRemove, username: "user@1234.com" } as User,
      ]);
      localLoginGetByQueryStub.resolves([
        { id: localLoginIdToRemove },
      ] as LocalLogin[]);

      await userDeleteAllInfo.deleteUser(userDetailIdToRemove);

      return expect(userRemoveStub.getCall(0).calledWithMatch(userIdToRemove))
        .to.be.true;
    });

    it("should call localLoginStorage.remove with correct data", async () => {
      const userIdToRemove = "5daf2cf19f92d901e41c10d4";
      const userDetailIdToRemove = "5daf2cf19f92d901e41c10d6";
      const localLoginIdToRemove = "5daf2cf19f92d901e41c10ff";

      userRemoveStub.resolves({} as User);
      localLoginRemoveStub.resolves({} as LocalLogin);

      userGetByQueryStub.resolves([
        { id: userIdToRemove, username: "user@1234.com" } as User,
      ]);

      localLoginGetByQueryStub.resolves([
        { id: localLoginIdToRemove },
      ] as LocalLogin[]);

      await userDeleteAllInfo.deleteUser(userDetailIdToRemove);

      return expect(
        localLoginRemoveStub.getCall(0).calledWithMatch(localLoginIdToRemove),
      ).to.be.true;
    });

    it("should resolve with true if user info was deleted", async () => {
      const userIdToRemove = "5daf2cf19f92d901e41c10d4";
      const userDetailIdToRemove = "5daf2cf19f92d901e41c10d6";
      const localLoginIdToRemove = "5daf2cf19f92d901e41c10ff";

      userRemoveStub.resolves({} as User);
      localLoginRemoveStub.resolves({} as LocalLogin);

      userGetByQueryStub.resolves([
        { id: userIdToRemove, username: "user@1234.com" } as User,
      ]);
      localLoginGetByQueryStub.resolves([
        { id: localLoginIdToRemove },
      ] as LocalLogin[]);

      return expect(userDeleteAllInfo.deleteUser(userDetailIdToRemove)).to
        .eventually.be.fulfilled;
    });
  });
});
