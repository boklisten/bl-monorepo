import UserHandler from "@backend/express/auth/user/user.handler.js";
import { PendingPasswordResetPostHook } from "@backend/express/collections/pending-password-reset/hooks/pending-password-reset-post.hook.js";
import BlCrypto from "@backend/express/config/bl-crypto.js";
import Messenger from "@backend/express/messenger/messenger.js";
import { User } from "@backend/types/user.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { PasswordResetRequest } from "@shared/password-reset/password-reset-request.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("PendingPasswordResetPostHook", (group) => {
  const pendingPasswordResetPostHook = new PendingPasswordResetPostHook();

  const testUsername = "albert@blapi.com";
  let testUser: User;
  const testPasswordResetRequest: PasswordResetRequest = {
    email: testUsername,
  };

  const testSalt = "salt";
  const testToken = "aLongRandomTokenString";
  const testId = "IDentificator";
  let sandbox: sinon.SinonSandbox;
  let messengerPasswordResetStub: sinon.SinonStub;

  group.each.setup(() => {
    testUser = {
      id: "user1",
      userDetail: "userDetail1",
      permission: "customer",
      login: {
        provider: "local",
        providerId: "local123",
      },
      blid: "u#xyz",
      username: testUsername,
      valid: true,
      user: {
        id: "u#xyz",
        permission: "customer",
      },
    } as User;

    sandbox = createSandbox();
    sandbox
      .stub(UserHandler, "getByUsername")
      .callsFake(async (username: string) => {
        if (username !== testUsername) {
          throw new BlError("username is not found");
        }
        return testUser;
      });
    sandbox
      .stub(BlCrypto, "random")
      .onFirstCall()
      .returns(testId)
      .onSecondCall()
      .returns(testToken)
      .onThirdCall()
      .returns(testSalt);
    messengerPasswordResetStub = sandbox
      .stub(Messenger, "passwordReset")
      .returns(new Promise((resolve) => resolve()));
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if passwordReset is null, empty or undefined", async () => {
    return expect(
      pendingPasswordResetPostHook.before(undefined),
    ).to.be.rejectedWith(
      BlError,
      /passwordResetRequest.email is null, empty or undefined/,
    );
  });

  test("should reject if passwordResetRequest.email is undefined", async () => {
    // @ts-expect-error fixme: auto ignored
    const passwordResetRequest: PasswordResetRequest = { email: undefined };

    return expect(
      pendingPasswordResetPostHook.before(passwordResetRequest),
    ).to.be.rejectedWith(
      BlError,
      /passwordResetRequest.email is null, empty or undefined/,
    );
  });

  test("should reject if username (email) is not found in storage", async () => {
    const passwordResetRequest: PasswordResetRequest = {
      email: "cityofatlantis@mail.com",
    };

    return expect(
      pendingPasswordResetPostHook.before(passwordResetRequest),
    ).to.be.rejectedWith(
      BlError,
      /username "cityofatlantis@mail.com" not found/,
    );
  });

  test("should send email to user with reset password token", async () => {
    await pendingPasswordResetPostHook
      .before(testPasswordResetRequest)
      .then(() => {
        expect(messengerPasswordResetStub.called).to.be.true;

        return expect(
          messengerPasswordResetStub.calledWithExactly(
            testUser.id,
            testUser.username,
            testId,
            testToken,
          ),
        ).to.be.true;
      });
  });
});
