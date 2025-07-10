import { HttpContext } from "@adonisjs/core/http";
import hash from "@adonisjs/core/services/hash";
import logger from "@adonisjs/core/services/logger";

import LocalLoginHandler from "#services/auth/local/local-login.handler";
import UserHandler from "#services/auth/user/user.handler";
import BlCrypto from "#services/config/bl-crypto";
import Messenger from "#services/messenger/messenger";
import { BlStorage } from "#services/storage/bl-storage";
import {
  forgotPasswordValidator,
  passwordResetValidator,
} from "#validators/auth_validator";

export default class PasswordResetController {
  async forgotPasswordSend({ request }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator);
    const token = BlCrypto.random();
    const salt = BlCrypto.random();
    const tokenHash = await hash.make(token + salt);

    const existingUser = await UserHandler.getOrNull(email);
    if (!existingUser) return;

    try {
      const passwordReset = await BlStorage.PendingPasswordResets.add({
        email,
        tokenHash,
        salt,
      });
      await Messenger.passwordReset(email, passwordReset.id, token);
    } catch (error) {
      logger.error(
        `Failed to send password reset email to ${email}, error: ${error}`,
      );
    }
  }

  async resetPasswordStore({ request, response }: HttpContext) {
    const { resetId, resetToken, newPassword } = await request.validateUsing(
      passwordResetValidator,
    );

    try {
      const pendingPasswordReset =
        await BlStorage.PendingPasswordResets.get(resetId);

      await hash.assertEquals(
        pendingPasswordReset.tokenHash,
        resetToken + pendingPasswordReset.salt,
      );

      try {
        await LocalLoginHandler.setPassword(
          pendingPasswordReset.email,
          newPassword,
        );
        await BlStorage.PendingPasswordResets.remove(pendingPasswordReset.id);
      } catch (error) {
        logger.error(
          `Failed to update password for ${pendingPasswordReset.email}: ${error}`,
        );
        return response.internalServerError();
      }
    } catch (error) {
      logger.info(`Rejected password reset request, reason: ${error}`);
      return response.forbidden();
    }

    return newPassword;
  }
}
