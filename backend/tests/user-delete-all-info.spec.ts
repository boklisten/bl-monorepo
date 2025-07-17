import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { DeleteUserService } from "#services/collections/user-detail/helpers/delete-user-service";
import { BlStorage } from "#services/storage/bl-storage";
import { User } from "#services/types/user";
chaiUse(chaiAsPromised);
should();

test.group("UserDeleteAllInfo", (group) => {
  const userDeleteAllInfo = new DeleteUserService();
  let userRemoveStub: sinon.SinonStub;
  let userGetByQueryStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    userRemoveStub = sandbox.stub(BlStorage.Users, "remove");
    userGetByQueryStub = sandbox.stub(BlStorage.Users, "getByQuery");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should call userStorage.remove with correct data", async () => {
    const userIdToRemove = "5daf2cf19f92d901e41c10d4";
    const userDetailIdToRemove = "5daf2cf19f92d901e41c10d6";

    userRemoveStub.resolves({} as User);

    userGetByQueryStub.resolves([
      { id: userIdToRemove, username: "user@1234.com" } as User,
    ]);

    await userDeleteAllInfo.deleteUser(userDetailIdToRemove);

    expect(userRemoveStub.getCall(0).calledWithMatch(userIdToRemove)).to.be
      .true;
  });

  test("should resolve with true if user info was deleted", async () => {
    const userIdToRemove = "5daf2cf19f92d901e41c10d4";
    const userDetailIdToRemove = "5daf2cf19f92d901e41c10d6";

    userRemoveStub.resolves({} as User);

    userGetByQueryStub.resolves([
      { id: userIdToRemove, username: "user@1234.com" } as User,
    ]);

    return expect(userDeleteAllInfo.deleteUser(userDetailIdToRemove)).to
      .eventually.be.fulfilled;
  });
});
