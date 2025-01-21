import { ConfirmPendingPasswordResetOperation } from "@backend/collections/pending-password-reset/operations/confirm-pending-password-reset.operation.js";
import BlCrypto from "@backend/crypto/bl-crypto.js";
import { BlApiRequest } from "@backend/request/bl-api-request.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { PendingPasswordReset } from "@shared/password-reset/pending-password-reset.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import "mocha";
import LocalLoginHandler from "@backend/auth/local/local-login.handler.js";

chaiUse(chaiAsPromised);
should();

describe("ConfirmPendingPasswordResetOperation", () => {
  const confirmPendingPasswordResetOperation =
    new ConfirmPendingPasswordResetOperation();
  let testBlApiRequest: BlApiRequest;
  let testPendingPasswordReset: PendingPasswordReset;
  let localLoginUpdateSuccess: boolean;
  const testToken = "hablebable";
  const testSalt = "salt";
  let tokenHash: string;
  let sandbox: sinon.SinonSandbox;

  beforeEach(async () => {
    tokenHash = await BlCrypto.hash(testToken, testSalt);
    testPendingPasswordReset = {
      id: "id",
      tokenHash,
      email: "user@mail.com",
      salt: testSalt,
      creationTime: new Date(),
      active: true,
    };
    testBlApiRequest = {
      documentId: testPendingPasswordReset.id,
      data: {
        resetToken: testToken,
        newPassword: "newPassword123",
      },
    };

    localLoginUpdateSuccess = true;

    sandbox = createSandbox();
    sandbox.stub(BlStorage.PendingPasswordResets, "get").callsFake((id) => {
      if (id !== testPendingPasswordReset.id) {
        return Promise.reject(new BlError("not found"));
      }

      return Promise.resolve(testPendingPasswordReset);
    });

    sandbox
      .stub(BlStorage.PendingPasswordResets, "update")
      .callsFake(async (id, data: unknown) => {
        return Object.assign(testPendingPasswordReset, data);
      });

    sandbox.stub(LocalLoginHandler, "setPassword").callsFake(() => {
      if (localLoginUpdateSuccess) {
        return Promise.resolve(true);
      }

      return Promise.reject(new BlError("could not set password"));
    });
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("#run", () => {
    it("should reject if documentId is not found", async () => {
      testBlApiRequest.documentId = "notFoundPasswordReset";

      await expect(
        confirmPendingPasswordResetOperation.run(testBlApiRequest),
      ).to.be.rejectedWith(
        BlError,
        /PendingPasswordReset "notFoundPasswordReset" not found/,
      );
    });

    it("should reject if token does not match", async () => {
      // @ts-expect-error fixme: auto ignored
      testBlApiRequest.data["resetToken"] = "notAValidToken";

      await expect(
        confirmPendingPasswordResetOperation.run(testBlApiRequest),
      ).to.be.rejectedWith(
        BlError,
        /Invalid password reset attempt: computed token hash does not match stored hash/,
      );
    });

    it("should reject if blApiRequest.data.newPassword is null, empty or undefined", async () => {
      // @ts-expect-error fixme: auto ignored
      testBlApiRequest.data["newPassword"] = null;

      await expect(
        confirmPendingPasswordResetOperation.run(testBlApiRequest),
      ).to.be.rejectedWith(
        BlError,
        /blApiRequest.data.newPassword is null, empty or undefined/,
      );
    });

    it("should reject if blApiRequest.data.newPassword is under length of 6", async () => {
      // @ts-expect-error fixme: auto ignored
      testBlApiRequest.data["newPassword"] = "abcde";

      await expect(
        confirmPendingPasswordResetOperation.run(testBlApiRequest),
      ).to.be.rejectedWith(
        BlError,
        /blApiRequest.data.newPassword is under length of 6/,
      );
    });

    it("should reject if PendingPasswordReset is expired", async () => {
      testPendingPasswordReset.creationTime = new Date();
      testPendingPasswordReset.creationTime.setDate(
        testPendingPasswordReset.creationTime.getDate() - 8,
      );

      await expect(
        confirmPendingPasswordResetOperation.run(testBlApiRequest),
      ).to.be.rejectedWith(BlError, /PendingPasswordReset (.*) expired/);
    });

    it("should accept even if PendingPasswordReset is nearing expired", async () => {
      const date = new Date();
      date.setDate(date.getDate() - 6);
      testPendingPasswordReset.creationTime = date;

      await confirmPendingPasswordResetOperation.run(testBlApiRequest);
    });

    it("should reject if LocalLoginHandler.setPassword rejects", async () => {
      localLoginUpdateSuccess = false;

      await expect(
        confirmPendingPasswordResetOperation.run(testBlApiRequest),
      ).to.be.rejectedWith(
        BlError,
        /Could not update localLogin with password/,
      );
    });

    it("should reject if PendingPasswordReset inactive", async () => {
      testPendingPasswordReset.active = false;

      await expect(
        confirmPendingPasswordResetOperation.run(testBlApiRequest),
      ).to.be.rejectedWith(BlError, /PendingPasswordReset (.*) already used/);
    });

    it("should deactivate PendingPasswordReset after use", async () => {
      await confirmPendingPasswordResetOperation.run(testBlApiRequest);
      expect(testPendingPasswordReset.active).to.be.false;
    });

    it("should not allow reusing PendingPasswordReset", async () => {
      expect(testPendingPasswordReset.active).to.be.true;
      await confirmPendingPasswordResetOperation.run(testBlApiRequest);
      expect(testPendingPasswordReset.active).to.be.false;
      await expect(
        confirmPendingPasswordResetOperation.run(testBlApiRequest),
      ).to.be.rejectedWith(BlError, /PendingPasswordReset (.*) already used/);
    });

    it("should resolve if given valid ID, token and password", async () => {
      await expect(confirmPendingPasswordResetOperation.run(testBlApiRequest))
        .to.be.fulfilled;
    });
  });
});
