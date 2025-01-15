import { LocalLoginHandler } from "@backend/auth/local/local-login.handler";
import { PendingPasswordResetModel } from "@backend/collections/pending-password-reset/pending-password-reset.model";
import { SeCrypto } from "@backend/crypto/se.crypto";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { PasswordResetConfirmationRequest } from "@shared/password-reset/password-reset-confirmation-request";
import { PendingPasswordReset } from "@shared/password-reset/pending-password-reset";

export class ConfirmPendingPasswordResetOperation implements Operation {
  private readonly pendingPasswordResetStorage: BlStorage<PendingPasswordReset>;
  private readonly localLoginHandler: LocalLoginHandler;
  private readonly seCrypto: SeCrypto;

  constructor(
    pendingPasswordResetStorage?: BlStorage<PendingPasswordReset>,
    localLoginHandler?: LocalLoginHandler,
    seCrypto?: SeCrypto,
  ) {
    this.pendingPasswordResetStorage =
      pendingPasswordResetStorage ?? new BlStorage(PendingPasswordResetModel);
    this.localLoginHandler = localLoginHandler ?? new LocalLoginHandler();
    this.seCrypto = seCrypto ?? new SeCrypto();
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const pendingPasswordResetId = blApiRequest.documentId;
    const passwordResetConfirmationRequest: unknown = blApiRequest.data;
    validatePasswordResetConfirmationRequest(passwordResetConfirmationRequest);

    const pendingPasswordReset = await this.pendingPasswordResetStorage
      // @ts-expect-error fixme: auto ignored
      .get(pendingPasswordResetId)
      .catch((getPasswordResetError) => {
        throw new BlError(
          `PendingPasswordReset "${pendingPasswordResetId}" not found or expired`,
        )
          .code(702)
          .add(getPasswordResetError);
      });

    validatePendingPasswordResetNotExpired(pendingPasswordReset);
    validatePendingPasswordResetUnused(pendingPasswordReset);
    await verifyResetToken(
      passwordResetConfirmationRequest.resetToken,
      pendingPasswordReset,
      this.seCrypto,
    );

    await updatePassword(
      pendingPasswordReset,
      passwordResetConfirmationRequest.newPassword,
      this.localLoginHandler,
    );

    await deactivatePendingPasswordReset(
      pendingPasswordReset,
      this.pendingPasswordResetStorage,
    );

    return new BlapiResponse([]);
  }
}

function validatePasswordResetConfirmationRequest(
  candidate: unknown,
): asserts candidate is PasswordResetConfirmationRequest {
  // @ts-expect-error fixme: auto ignored
  if (!candidate || !candidate["resetToken"]) {
    throw new BlError(
      "blApiRequest.data.resetToken is null, empty or undefined",
    ).code(701);
  }

  // @ts-expect-error fixme: auto ignored
  if (typeof candidate["resetToken"] !== "string") {
    throw new BlError("blApiRequest.data.resetToken is not a string").code(701);
  }

  // @ts-expect-error fixme: auto ignored
  if (!candidate || !candidate["newPassword"]) {
    throw new BlError(
      "blApiRequest.data.newPassword is null, empty or undefined",
    ).code(701);
  }

  // @ts-expect-error fixme: auto ignored
  if (typeof candidate["newPassword"] !== "string") {
    throw new BlError("blApiRequest.data.newPassword is not a string").code(
      701,
    );
  }

  // @ts-expect-error fixme: auto ignored
  const newPassword: string = candidate["newPassword"];

  if (newPassword.length < 6) {
    throw new BlError(
      "blApiRequest.data.newPassword is under length of 6",
    ).code(701);
  }
}

async function verifyResetToken(
  candidateToken: string,
  pendingPasswordReset: PendingPasswordReset,
  seCrypto: SeCrypto,
): Promise<void> {
  const candiateTokenHash = await seCrypto.hash(
    candidateToken,
    pendingPasswordReset.salt,
  );
  if (
    !seCrypto.timingSafeEqual(candiateTokenHash, pendingPasswordReset.tokenHash)
  ) {
    throw new BlError(
      "Invalid password reset attempt: computed token hash does not match stored hash",
    ).code(702);
  }
}

function validatePendingPasswordResetNotExpired(
  pendingPasswordReset: PendingPasswordReset,
): void {
  const ms_in_week = 1000 * 60 * 60 * 24 * 7;
  if (
    // @ts-expect-error fixme: auto ignored
    Date.now() - pendingPasswordReset.creationTime.getTime() >
    ms_in_week
  ) {
    throw new BlError(
      `PendingPasswordReset "${pendingPasswordReset.id}" expired`,
    )
      .code(702)
      .store("expiredAt", pendingPasswordReset.creationTime);
  }
}

function validatePendingPasswordResetUnused(
  pendingPasswordReset: PendingPasswordReset,
): void {
  if (!pendingPasswordReset.active) {
    throw new BlError(
      `PendingPasswordReset "${pendingPasswordReset.id}" already used`,
    ).code(702);
  }
}

async function updatePassword(
  pendingPasswordReset: PendingPasswordReset,
  newPassword: string,
  localLoginHandler: LocalLoginHandler,
): Promise<void> {
  await localLoginHandler
    .setPassword(pendingPasswordReset.email, newPassword)
    .catch((setPasswordError: BlError) => {
      throw new BlError("Could not update localLogin with password")
        .code(200)
        .add(setPasswordError);
    });
}

async function deactivatePendingPasswordReset(
  pendingPasswordReset: PendingPasswordReset,
  pendingPasswordResetStorage: BlStorage<PendingPasswordReset>,
): Promise<void> {
  await pendingPasswordResetStorage
    .update(pendingPasswordReset.id, { active: false })
    .catch((updateActiveError) => {
      throw new BlError(
        `Unable to set PendingPasswordReset ${pendingPasswordReset.id} to not active`,
      ).add(updateActiveError);
    });
}
