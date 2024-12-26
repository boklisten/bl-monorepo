import { UserHandler } from "@backend/auth/user/user.handler";
import { SeCrypto } from "@backend/crypto/se.crypto";
import { Hook } from "@backend/hook/hook";
import { Messenger } from "@backend/messenger/messenger";
import { BlError } from "@shared/bl-error/bl-error";
import { PasswordResetRequest } from "@shared/password-reset/password-reset-request";
import { PendingPasswordReset } from "@shared/password-reset/pending-password-reset";

export class PendingPasswordResetPostHook extends Hook {
  constructor(
    private readonly userHandler?: UserHandler,
    private readonly seCrypto?: SeCrypto,
    private readonly messenger?: Messenger,
  ) {
    super();
    this.userHandler ??= new UserHandler();
    this.seCrypto ??= new SeCrypto();
    this.messenger ??= new Messenger();
  }

  override async before(
    passwordResetRequest: unknown,
  ): Promise<PendingPasswordReset> {
    validatePasswordResetRequest(passwordResetRequest);

    const normalizedEmail = passwordResetRequest.email
      .toLowerCase()
      .replace(" ", "");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user = await this.userHandler
      .getByUsername(normalizedEmail)
      .catch((getUserError: BlError) => {
        throw new BlError(`username "${normalizedEmail}" not found`)
          .code(10_702)
          .add(getUserError);
      });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const id = this.seCrypto.random();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const token = this.seCrypto.random();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const salt = this.seCrypto.random();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tokenHash = await this.seCrypto.hash(token, salt);

    // We should really wait to send the email until the password reset has been successfully written to the
    // database, but it would be poor security to save the unhashed token in the database, and we have no other way
    // of passing information from before to after, so this is the lesser evil.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.messenger
      .passwordReset(user.id, normalizedEmail, id, token)
      .catch(() => {
        throw new BlError(
          `Unable to send password reset email to ${normalizedEmail}`,
        ).code(10_200);
      });

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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!candidate || !candidate["email"]) {
    throw new BlError(
      "passwordResetRequest.email is null, empty or undefined",
    ).code(701);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof candidate["email"] !== "string") {
    throw new BlError("passwordResetRequest.email is not a string").code(701);
  }
}
