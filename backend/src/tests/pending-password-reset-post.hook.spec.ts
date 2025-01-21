import "mocha";
import UserHandler from "@backend/auth/user/user.handler.js";
import { PendingPasswordResetPostHook } from "@backend/collections/pending-password-reset/hooks/pending-password-reset-post.hook.js";
import BlCrypto from "@backend/config/bl-crypto.js";
import Messenger from "@backend/messenger/messenger.js";
import { User } from "@backend/types/user.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { PasswordResetRequest } from "@shared/password-reset/password-reset-request.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("PendingPasswordResetPostHook", () => {
  const pendingPasswordResetPostHook = new PendingPasswordResetPostHook();

  const testUsername = "albert@blapi.com";
  let testUser: User;
  const testPasswordResetRequest: PasswordResetRequest = {
    email: testUsername,
  };

  // @ts-expect-error fixme: auto ignored
  let testPendingPasswordReset: PendingPasswordReset;
  const testSalt = "salt";
  const testToken = "aLongRandomTokenString";
  let tokenHash: string;
  const testId = "IDentificator";
  let sandbox: sinon.SinonSandbox;

  beforeEach(async () => {
    tokenHash = await BlCrypto.hash(testToken, testSalt);

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
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("#before", () => {
    it("should reject if passwordReset is null, empty or undefined", async () => {
      await expect(
        pendingPasswordResetPostHook.before(undefined),
      ).to.be.rejectedWith(
        BlError,
        /passwordResetRequest.email is null, empty or undefined/,
      );
    });

    it("should reject if passwordResetRequest.email is undefined", async () => {
      // @ts-expect-error fixme: auto ignored
      const passwordResetRequest: PasswordResetRequest = { email: undefined };

      await expect(
        pendingPasswordResetPostHook.before(passwordResetRequest),
      ).to.be.rejectedWith(
        BlError,
        /passwordResetRequest.email is null, empty or undefined/,
      );
    });

    it("should reject if username (email) is not found in storage", async () => {
      const passwordResetRequest: PasswordResetRequest = {
        email: "cityofatlantis@mail.com",
      };

      await expect(
        pendingPasswordResetPostHook.before(passwordResetRequest),
      ).to.be.rejectedWith(
        BlError,
        /username "cityofatlantis@mail.com" not found/,
      );
    });

    beforeEach(() => {
      testPendingPasswordReset = {
        id: "passwordReset1",
        email: testUsername,
        tokenHash,
        salt: testSalt,
      };
    });

    describe("when everything is valid", () => {
      let messengerPasswordResetStub: sinon.SinonStub;
      let sandbox: sinon.SinonSandbox;

      beforeEach(async () => {
        sandbox = createSandbox();
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
      afterEach(() => {
        sandbox.restore();
      });

      it("should send email to user with reset password token", async () => {
        await pendingPasswordResetPostHook
          .before(testPasswordResetRequest)
          .then(() => {
            expect(messengerPasswordResetStub.called).to.be.true;

            expect(
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
  });
});
