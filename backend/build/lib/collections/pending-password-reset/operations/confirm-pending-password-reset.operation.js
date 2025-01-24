import LocalLoginHandler from "@backend/lib/auth/local/local-login.handler.js";
import BlCrypto from "@backend/lib/config/bl-crypto.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
export class ConfirmPendingPasswordResetOperation {
    async run(blApiRequest) {
        const pendingPasswordResetId = blApiRequest.documentId;
        const passwordResetConfirmationRequest = blApiRequest.data;
        validatePasswordResetConfirmationRequest(passwordResetConfirmationRequest);
        const pendingPasswordReset = await BlStorage.PendingPasswordResets.get(pendingPasswordResetId).catch((getPasswordResetError) => {
            throw new BlError(`PendingPasswordReset "${pendingPasswordResetId}" not found or expired`)
                .code(702)
                .add(getPasswordResetError);
        });
        validatePendingPasswordResetNotExpired(pendingPasswordReset);
        validatePendingPasswordResetUnused(pendingPasswordReset);
        await verifyResetToken(passwordResetConfirmationRequest.resetToken, pendingPasswordReset);
        await updatePassword(pendingPasswordReset, passwordResetConfirmationRequest.newPassword);
        await deactivatePendingPasswordReset(pendingPasswordReset);
        return new BlapiResponse([]);
    }
}
function validatePasswordResetConfirmationRequest(candidate) {
    // @ts-expect-error fixme: auto ignored
    if (!candidate || !candidate["resetToken"]) {
        throw new BlError("blApiRequest.data.resetToken is null, empty or undefined").code(701);
    }
    // @ts-expect-error fixme: auto ignored
    if (typeof candidate["resetToken"] !== "string") {
        throw new BlError("blApiRequest.data.resetToken is not a string").code(701);
    }
    // @ts-expect-error fixme: auto ignored
    if (!candidate || !candidate["newPassword"]) {
        throw new BlError("blApiRequest.data.newPassword is null, empty or undefined").code(701);
    }
    // @ts-expect-error fixme: auto ignored
    if (typeof candidate["newPassword"] !== "string") {
        throw new BlError("blApiRequest.data.newPassword is not a string").code(701);
    }
    // @ts-expect-error fixme: auto ignored
    const newPassword = candidate["newPassword"];
    if (newPassword.length < 6) {
        throw new BlError("blApiRequest.data.newPassword is under length of 6").code(701);
    }
}
async function verifyResetToken(candidateToken, pendingPasswordReset) {
    const candiateTokenHash = await BlCrypto.hash(candidateToken, pendingPasswordReset.salt);
    if (!BlCrypto.timingSafeEqual(candiateTokenHash, pendingPasswordReset.tokenHash)) {
        throw new BlError("Invalid password reset attempt: computed token hash does not match stored hash").code(702);
    }
}
function validatePendingPasswordResetNotExpired(pendingPasswordReset) {
    const ms_in_week = 1000 * 60 * 60 * 24 * 7;
    if (
    // @ts-expect-error fixme: auto ignored
    Date.now() - pendingPasswordReset.creationTime.getTime() >
        ms_in_week) {
        throw new BlError(`PendingPasswordReset "${pendingPasswordReset.id}" expired`)
            .code(702)
            .store("expiredAt", pendingPasswordReset.creationTime);
    }
}
function validatePendingPasswordResetUnused(pendingPasswordReset) {
    if (!pendingPasswordReset.active) {
        throw new BlError(`PendingPasswordReset "${pendingPasswordReset.id}" already used`).code(702);
    }
}
async function updatePassword(pendingPasswordReset, newPassword) {
    await LocalLoginHandler.setPassword(pendingPasswordReset.email, newPassword).catch((setPasswordError) => {
        throw new BlError("Could not update localLogin with password")
            .code(200)
            .add(setPasswordError);
    });
}
async function deactivatePendingPasswordReset(pendingPasswordReset) {
    await BlStorage.PendingPasswordResets.update(pendingPasswordReset.id, {
        active: false,
    }).catch((updateActiveError) => {
        throw new BlError(`Unable to set PendingPasswordReset ${pendingPasswordReset.id} to not active`).add(updateActiveError);
    });
}
