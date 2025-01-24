import UserHandler from "@backend/lib/auth/user/user.handler.js";
import BlCrypto from "@backend/lib/config/bl-crypto.js";
import { Hook } from "@backend/lib/hook/hook.js";
import Messenger from "@backend/lib/messenger/messenger.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class PendingPasswordResetPostHook extends Hook {
    async before(passwordResetRequest) {
        validatePasswordResetRequest(passwordResetRequest);
        const normalizedEmail = passwordResetRequest.email
            .toLowerCase()
            .replace(" ", "");
        const user = await UserHandler.getByUsername(normalizedEmail).catch((getUserError) => {
            throw new BlError(`username "${normalizedEmail}" not found`)
                .code(10_702)
                .add(getUserError);
        });
        const id = BlCrypto.random();
        const token = BlCrypto.random();
        const salt = BlCrypto.random();
        const tokenHash = await BlCrypto.hash(token, salt);
        // We should really wait to send the email until the password reset has been successfully written to the
        // database, but it would be poor security to save the unhashed token in the database, and we have no other way
        // of passing information from before to after, so this is the lesser evil.
        await Messenger.passwordReset(user.id, normalizedEmail, id, token).catch(() => {
            throw new BlError(`Unable to send password reset email to ${normalizedEmail}`).code(10_200);
        });
        return {
            id,
            email: normalizedEmail,
            tokenHash,
            salt,
        };
    }
    // Don't return the stored secrets!
    async after() {
        return [];
    }
}
function validatePasswordResetRequest(candidate) {
    // @ts-expect-error fixme: auto ignored
    if (!candidate || !candidate["email"]) {
        throw new BlError("passwordResetRequest.email is null, empty or undefined").code(701);
    }
    // @ts-expect-error fixme: auto ignored
    if (typeof candidate["email"] !== "string") {
        throw new BlError("passwordResetRequest.email is not a string").code(701);
    }
}
