import { DeleteUserService } from "@backend/collections/user-detail/helpers/delete-user-service.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { LocalLogin } from "@backend/types/local-login.js";
import { User } from "@backend/types/user.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();

describe("UserDeleteAllInfo", () => {
  const userDeleteAllInfo = new DeleteUserService();
  let localLoginRemoveStub: sinon.SinonStub;
  let localLoginGetByQueryStub: sinon.SinonStub;
  let userRemoveStub: sinon.SinonStub;
  let userGetByQueryStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = createSandbox();
    localLoginRemoveStub = sandbox.stub(BlStorage.LocalLogins, "remove");
    localLoginGetByQueryStub = sandbox.stub(
      BlStorage.LocalLogins,
      "getByQuery",
    );
    userRemoveStub = sandbox.stub(BlStorage.Users, "remove");
    userGetByQueryStub = sandbox.stub(BlStorage.Users, "getByQuery");
  });
  afterEach(() => {
    sandbox.restore();
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
