import { UserHandler } from "@backend/auth/user/user.handler";
import { PendingPasswordResetPostHook } from "@backend/collections/pending-password-reset/hooks/pending-password-reset-post.hook";
import { User } from "@backend/collections/user/user";
import { SeCrypto } from "@backend/crypto/se.crypto";
import { Messenger } from "@backend/messenger/messenger";
import { BlError } from "@shared/bl-error/bl-error";
import { PasswordResetRequest } from "@shared/password-reset/password-reset-request";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import "mocha";

chaiUse(chaiAsPromised);
should();

describe("PendingPasswordResetPostHook", () => {
  const userHandler = new UserHandler();
  const seCrypto = new SeCrypto();
  const messenger = new Messenger();
  const pendingPasswordResetPostHook = new PendingPasswordResetPostHook(
    userHandler,
    seCrypto,
    messenger,
  );

  const testUsername = "albert@blapi.com";
  let testUser: User;
  const testPasswordResetRequest: PasswordResetRequest = {
    email: testUsername,
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let testPendingPasswordReset: PendingPasswordReset;
  const testSalt = "salt";
  const testToken = "aLongRandomTokenString";
  let tokenHash: string;
  const testId = "IDentificator";

  beforeEach(async () => {
    tokenHash = await new SeCrypto().hash(testToken, testSalt);

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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const passwordResetRequest: PasswordResetRequest = { email: undefined };

      await expect(
        pendingPasswordResetPostHook.before(passwordResetRequest),
      ).to.be.rejectedWith(
        BlError,
        /passwordResetRequest.email is null, empty or undefined/,
      );
    });

    sinon
      .stub(userHandler, "getByUsername")
      .callsFake(async (username: string) => {
        if (username !== testUsername) {
          throw new BlError("username is not found");
        }
        return testUser;
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
      const messengerPasswordResetStub = sinon
        .stub(messenger, "passwordReset")
        .returns(new Promise((resolve) => resolve()));

      beforeEach(async () => {
        sinon
          .stub(seCrypto, "random")
          .onFirstCall()
          .returns(testId)
          .onSecondCall()
          .returns(testToken)
          .onThirdCall()
          .returns(testSalt);
        messengerPasswordResetStub.resetHistory();
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
