import "mocha";

import { BlCollectionName } from "@backend/collections/bl-collection";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { User } from "@backend/collections/user/user";
import { DeleteUserService } from "@backend/collections/user-detail/helpers/delete-user-service";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Invoice } from "@shared/invoice/invoice";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
chaiUse(chaiAsPromised);
should();

describe("UserDeleteAllInfo", () => {
  const localLoginStorage = new BlDocumentStorage<LocalLogin>(
    BlCollectionName.LocalLogins,
  );
  const userStorage = new BlDocumentStorage<User>(BlCollectionName.Users);
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const customerItemStorage = new BlDocumentStorage<CustomerItem>(
    BlCollectionName.CustomerItems,
  );
  const invoiceStorage = new BlDocumentStorage<Invoice>(
    BlCollectionName.Invoices,
  );
  const orderStorage = new BlDocumentStorage<Order>(BlCollectionName.Orders);
  const paymentStorage = new BlDocumentStorage<Payment>(
    BlCollectionName.Payments,
  );

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

      const accessToken = {
        details: "user777",
        permission: "admin",
      } as AccessToken;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const result = await userDeleteAllInfo.deleteUser(
        userDetailIdToRemove,
        accessToken,
      );

      return expect(
        userRemoveStub.getCall(0).calledWithMatch(userIdToRemove, {
          id: accessToken.details,
          permission: accessToken.permission,
        }),
      ).to.be.true;
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

      const accessToken = {
        details: "user777",
        permission: "admin",
      } as AccessToken;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const result = await userDeleteAllInfo.deleteUser(
        userDetailIdToRemove,
        accessToken,
      );

      return expect(
        localLoginRemoveStub.getCall(0).calledWithMatch(localLoginIdToRemove, {
          id: accessToken.details,
          permission: accessToken.permission,
        }),
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

      const accessToken = {
        details: "user777",
        permission: "admin",
      } as AccessToken;

      return expect(
        userDeleteAllInfo.deleteUser(userDetailIdToRemove, accessToken),
      ).to.eventually.be.fulfilled;
    });
  });
});
