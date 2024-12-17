import "mocha";

import { BlCollectionName } from "@backend/collections/bl-collection";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { User } from "@backend/collections/user/user";
import { UserDeleteAllInfo } from "@backend/collections/user-detail/helpers/user-delete-all-info";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
chai.use(chaiAsPromised);

describe("UserDeleteAllInfo", () => {
  const localLoginStorage = new BlDocumentStorage<LocalLogin>(
    BlCollectionName.LocalLogins,
  );
  const userStorage = new BlDocumentStorage<User>(BlCollectionName.Users);
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );

  const localLoginRemoveStub = sinon.stub(localLoginStorage, "remove");
  const localLoginGetByQueryStub = sinon.stub(localLoginStorage, "getByQuery");
  const userRemoveStub = sinon.stub(userStorage, "remove");
  const userGetByQueryStub = sinon.stub(userStorage, "getByQuery");
  const userDetailGetStub = sinon.stub(userDetailStorage, "get");

  const userDeleteAllInfo = new UserDeleteAllInfo(
    userStorage,
    localLoginStorage,
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
      const result = await userDeleteAllInfo.deleteAllInfo(
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
      const result = await userDeleteAllInfo.deleteAllInfo(
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

    it("should reject if there is more than one user with the same username", async () => {
      const userIdToRemove = "5daf2cf19f92d901e41c10d4";
      const userIdToRemove2 = "5daf2cf19f92d901e41c10d2";
      const userDetailIdToRemove = "5daf2cf19f92d901e41c10d6";
      const localLoginIdToRemove = "5daf2cf19f92d901e41c10ff";

      userRemoveStub.resolves({} as User);
      localLoginRemoveStub.resolves({} as LocalLogin);

      userGetByQueryStub.resolves([
        { id: userIdToRemove, username: "user@1234.com" } as User,
        { id: userIdToRemove2, username: "user@1234.com" } as User,
      ]);

      localLoginGetByQueryStub.resolves([
        { id: localLoginIdToRemove },
      ] as LocalLogin[]);

      const accessToken = {
        details: "user777",
        permission: "admin",
      } as AccessToken;

      return expect(
        userDeleteAllInfo.deleteAllInfo(userDetailIdToRemove, accessToken),
      ).to.eventually.be.rejectedWith(BlError, /multiple users was found/);
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
        userDeleteAllInfo.deleteAllInfo(userDetailIdToRemove, accessToken),
      ).to.eventually.be.true;
    });
  });
});
