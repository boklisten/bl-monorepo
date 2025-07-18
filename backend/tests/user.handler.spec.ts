import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import UserHandler from "#services/auth/user/user.handler";
import Messenger from "#services/messenger/messenger";
import { BlStorage } from "#services/storage/bl-storage";
import { User } from "#services/types/user";
import { BlError } from "#shared/bl-error/bl-error";
import { UserDetail } from "#shared/user/user-detail/user-detail";

chaiUse(chaiAsPromised);
should();

const testUser = {
  id: "user1",
  userDetail: "userDetail1",
  permission: "customer",
  blid: "",
  username: "bill@gmail.com",
} as User;

test.group("UserHandler", (group) => {
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();

    sandbox.stub(BlStorage.UserDetails, "add").callsFake(() => {
      return new Promise((resolve) => {
        resolve({
          id: testUser.userDetail,
          user: { id: testUser.blid },
        } as UserDetail);
      });
    });

    sandbox
      .stub(BlStorage.EmailValidations, "add")
      .resolves({ id: "foo", userDetailId: testUser.userDetail });
    sandbox.stub(Messenger, "emailConfirmation").resolves();
    sandbox.stub(BlStorage.Users, "add").resolves(testUser);
  });

  group.each.teardown(() => {
    sandbox.restore();
  });

  test("getByUsername() - when username is undefined should reject with BlError", async () => {
    const username = undefined;
    UserHandler
      // @ts-expect-error fixme: auto ignored
      .getByUsername(username)
      // @ts-expect-error fixme: auto ignored bad test types
      .should.be.rejectedWith(BlError);
  });

  test("getByUsername() - when username is not found should reject with BlError code 702 not found", async () => {
    const username = "thisis@notfound.com";

    UserHandler.getByUsername(username).catch((error: BlError) => {
      // @ts-expect-error fixme: auto ignored bad test types
      error.getCode().should.be.eq(702);
    });
  });
});
