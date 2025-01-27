import UserHandler from "#services/auth/user/user.handler";
import BlCrypto from "#services/config/bl-crypto";
import { Hook } from "#services/hook/hook";
import Messenger from "#services/messenger/messenger";
import { BlError } from "#shared/bl-error/bl-error";
import { PasswordResetRequest } from "#shared/password-reset/password-reset-request";
import { PendingPasswordReset } from "#shared/password-reset/pending-password-reset";

export class PendingPasswordResetPostHook extends Hook {
  override async before(
    passwordResetRequest: unknown,
  ): Promise<PendingPasswordReset> {
    validatePasswordResetRequest(passwordResetRequest);

    const normalizedEmail = passwordResetRequest.email
      .toLowerCase()
      .replace(" ", "");

    const user = await UserHandler.getByUsername(normalizedEmail).catch(
      (getUserError: BlError) => {
        throw new BlError(`username "${normalizedEmail}" not found`)
          .code(10_702)
          .add(getUserError);
      },
    );

    const id = BlCrypto.random();

    const token = BlCrypto.random();

    const salt = BlCrypto.random();

    const tokenHash = await BlCrypto.hash(token, salt);

    // We should really wait to send the email until the password reset has been successfully written to the
    // database, but it would be poor security to save the unhashed token in the database, and we have no other way
    // of passing information from before to after, so this is the lesser evil.

    await Messenger.passwordReset(user.id, normalizedEmail, id, token).catch(
      () => {
        throw new BlError(
          `Unable to send password reset email to ${normalizedEmail}`,
        ).code(10_200);
      },
    );

    return {
      id,
      email: normalizedEmail,
      tokenHash,
      salt,
    };
  }

  // Don't return the stored secrets!
  override async after(): Promise<never[]> {
    return [];
  }
}

function validatePasswordResetRequest(
  candidate: unknown,
): asserts candidate is PasswordResetRequest {
  // @ts-expect-error fixme: auto ignored
  if (!candidate || !candidate["email"]) {
    throw new BlError(
      "passwordResetRequest.email is null, empty or undefined",
    ).code(701);
  }

  // @ts-expect-error fixme: auto ignored
  if (typeof candidate["email"] !== "string") {
    throw new BlError("passwordResetRequest.email is not a string").code(701);
  }
}
