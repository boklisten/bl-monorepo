import { LocalLoginHandler } from "@backend/auth/local/local-login.handler";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { ConfirmPendingPasswordResetOperation } from "@backend/collections/pending-password-reset/operations/confirm-pending-password-reset.operation";
import { SeCrypto } from "@backend/crypto/se.crypto";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { PendingPasswordReset } from "@shared/password-reset/pending-password-reset";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import "mocha";

chai.use(chaiAsPromised);

describe("ConfirmPendingPasswordResetOperation", () => {
  const pendingPasswordResetStorage =
    new BlDocumentStorage<PendingPasswordReset>(
      BlCollectionName.PendingPasswordResets,
    );
  const localLoginHandler = new LocalLoginHandler();
  const resHandler = new SEResponseHandler();
  const confirmPendingPasswordResetOperation =
    new ConfirmPendingPasswordResetOperation(
      pendingPasswordResetStorage,
      localLoginHandler,
      resHandler,
    );
  let testBlApiRequest: BlApiRequest;
  let testPendingPasswordReset: PendingPasswordReset;
  let localLoginUpdateSuccess: boolean;
  const testToken = "hablebable";
  const testSalt = "salt";
  let tokenHash: string;

  beforeEach(async () => {
    tokenHash = await new SeCrypto().hash(testToken, testSalt);
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
  });

  sinon.stub(pendingPasswordResetStorage, "get").callsFake((id: string) => {
    if (id !== testPendingPasswordReset.id) {
      return Promise.reject(new BlError("not found"));
    }

    return Promise.resolve(testPendingPasswordReset);
  });

  sinon
    .stub(pendingPasswordResetStorage, "update")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .callsFake(async (id, data: unknown) => {
      return Object.assign(testPendingPasswordReset, data);
    });

  sinon.stub(localLoginHandler, "setPassword").callsFake(() => {
    if (localLoginUpdateSuccess) {
      return Promise.resolve(true);
    }

    return Promise.reject(new BlError("could not set password"));
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
      // @ts-ignore
      testBlApiRequest.data["resetToken"] = "notAValidToken";

      await expect(
        confirmPendingPasswordResetOperation.run(testBlApiRequest),
      ).to.be.rejectedWith(
        BlError,
        /Invalid password reset attempt: computed token hash does not match stored hash/,
      );
    });

    it("should reject if blApiRequest.data.newPassword is null, empty or undefined", async () => {
      // @ts-ignore
      testBlApiRequest.data["newPassword"] = null;

      await expect(
        confirmPendingPasswordResetOperation.run(testBlApiRequest),
      ).to.be.rejectedWith(
        BlError,
        /blApiRequest.data.newPassword is null, empty or undefined/,
      );
    });

    it("should reject if blApiRequest.data.newPassword is under length of 6", async () => {
      // @ts-ignore
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

    it("should reject if localLoginHandler.setPassword rejects", async () => {
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
