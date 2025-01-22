import { DeleteUserService } from "@backend/express/collections/user-detail/helpers/delete-user-service.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { LocalLogin } from "@backend/types/local-login.js";
import { User } from "@backend/types/user.js";
import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();

test.group("UserDeleteAllInfo", (group) => {
  const userDeleteAllInfo = new DeleteUserService();
  let localLoginRemoveStub: sinon.SinonStub;
  let localLoginGetByQueryStub: sinon.SinonStub;
  let userRemoveStub: sinon.SinonStub;
  let userGetByQueryStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    localLoginRemoveStub = sandbox.stub(BlStorage.LocalLogins, "remove");
    localLoginGetByQueryStub = sandbox.stub(
      BlStorage.LocalLogins,
      "getByQuery",
    );
    userRemoveStub = sandbox.stub(BlStorage.Users, "remove");
    userGetByQueryStub = sandbox.stub(BlStorage.Users, "getByQuery");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should call userStorage.remove with correct data", async () => {
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

    expect(userRemoveStub.getCall(0).calledWithMatch(userIdToRemove)).to.be
      .true;
  });

  test("should call localLoginStorage.remove with correct data", async () => {
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

    expect(
      localLoginRemoveStub.getCall(0).calledWithMatch(localLoginIdToRemove),
    ).to.be.true;
  });

  test("should resolve with true if user info was deleted", async () => {
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
