import {
  BlapiResponse,
  BlError,
  PasswordResetConfirmationRequest,
  PendingPasswordReset,
} from "@boklisten/bl-model";

import { LocalLoginHandler } from "@/auth/local/local-login.handler";
import { SystemUser } from "@/auth/permission/permission.service";
import { BlCollectionName } from "@/collections/bl-collection";
import { pendingPasswordResetSchema } from "@/collections/pending-password-reset/pending-password-reset.schema";
import { SeCrypto } from "@/crypto/se.crypto";
import { Operation } from "@/operation/operation";
import { BlApiRequest } from "@/request/bl-api-request";
import { SEResponseHandler } from "@/response/se.response.handler";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class ConfirmPendingPasswordResetOperation implements Operation {
  constructor(
    private readonly pendingPasswordResetStorage?: BlDocumentStorage<PendingPasswordReset>,
    private readonly localLoginHandler?: LocalLoginHandler,
    private readonly responseHandler?: SEResponseHandler,
    private readonly seCrypto?: SeCrypto,
  ) {
    this.pendingPasswordResetStorage ??= new BlDocumentStorage(
      BlCollectionName.PendingPasswordResets,
      pendingPasswordResetSchema,
    );
    this.localLoginHandler ??= new LocalLoginHandler();
    this.responseHandler ??= new SEResponseHandler();
    this.seCrypto ??= new SeCrypto();
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const pendingPasswordResetId = blApiRequest.documentId;
    const passwordResetConfirmationRequest: unknown = blApiRequest.data;
    validatePasswordResetConfirmationRequest(passwordResetConfirmationRequest);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pendingPasswordReset = await this.pendingPasswordResetStorage
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.seCrypto,
    );

    await updatePassword(
      pendingPasswordReset,
      passwordResetConfirmationRequest.newPassword,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.localLoginHandler,
    );

    await deactivatePendingPasswordReset(
      pendingPasswordReset,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.pendingPasswordResetStorage,
    );

    return new BlapiResponse([]);
  }
}

function validatePasswordResetConfirmationRequest(
  candidate: unknown,
): asserts candidate is PasswordResetConfirmationRequest {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!candidate || !candidate["resetToken"]) {
    throw new BlError(
      "blApiRequest.data.resetToken is null, empty or undefined",
    ).code(701);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof candidate["resetToken"] !== "string") {
    throw new BlError("blApiRequest.data.resetToken is not a string").code(701);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!candidate || !candidate["newPassword"]) {
    throw new BlError(
      "blApiRequest.data.newPassword is null, empty or undefined",
    ).code(701);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof candidate["newPassword"] !== "string") {
    throw new BlError("blApiRequest.data.newPassword is not a string").code(
      701,
    );
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    new Date().getTime() - pendingPasswordReset.creationTime.getTime() >
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
  pendingPasswordResetStorage: BlDocumentStorage<PendingPasswordReset>,
): Promise<void> {
  await pendingPasswordResetStorage
    .update(pendingPasswordReset.id, { active: false }, new SystemUser())
    .catch((updateActiveError) => {
      throw new BlError(
        `Unable to set PendingPasswordReset ${pendingPasswordReset.id} to not active`,
      ).add(updateActiveError);
    });
}
