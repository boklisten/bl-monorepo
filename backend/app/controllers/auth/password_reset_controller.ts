import { HttpContext } from "@adonisjs/core/http";
import hash from "@adonisjs/core/services/hash";

import BlCrypto from "#services/config/bl-crypto";
import { sendMail } from "#services/messenger/email/email_service";
import { EMAIL_TEMPLATES } from "#services/messenger/email/email_templates";
import { PasswordService } from "#services/password_service";
import { BlStorage } from "#services/storage/bl-storage";
import { UserService } from "#services/user_service";
import { PendingPasswordReset } from "#shared/password-reset/pending-password-reset";
import env from "#start/env";
import {
  forgotPasswordValidator,
  passwordResetValidator,
  passwordResetValidValidator,
} from "#validators/auth_validators";

async function getPasswordReset({
  resetId,
  resetToken,
}: {
  resetId: string;
  resetToken: string;
}) {
  let pendingPasswordReset: PendingPasswordReset;
  try {
    pendingPasswordReset = await BlStorage.PendingPasswordResets.get(resetId);
  } catch {
    return {
      message: `Lenken har utløpt. Du kan be om å få tilsendt en ny lenke på 'glemt passord'-siden`,
    };
  }

  try {
    await hash.assertEquals(pendingPasswordReset.tokenHash, resetToken);
  } catch {
    return {
      message: `Lenken er ugyldig. Du kan be om å få tilsendt en ny lenke på 'glemt passord'-siden`,
    };
  }

  const user = await UserService.getByUsername(pendingPasswordReset.email);
  if (!user) {
    throw new Error("Brukeren finnes ikke");
  }
  return { user, pendingPasswordReset };
}

export default class PasswordResetController {
  async requestPasswordReset({ request }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator);
    const token = BlCrypto.random();
    const tokenHash = await hash.make(token);

    const existingUser = await UserService.getByUsername(email);
    if (!existingUser) {
      return {
        message:
          "E-posten du har oppgitt er ikke tilknyttet noen bruker. Du kan forsøke et annet brukernavn, eller lage en ny bruker ved å trykke på 'registrer deg'",
      };
    }

    const passwordReset = await BlStorage.PendingPasswordResets.add({
      email,
      tokenHash,
    });

    const mailStatus = await sendMail({
      template: EMAIL_TEMPLATES.passwordReset,
      recipients: [
        {
          to: email,
          dynamicTemplateData: {
            passwordResetUri: `${env.get("CLIENT_URI")}auth/reset/${passwordReset.id}?resetToken=${token}`,
          },
        },
      ],
    });
    if (!mailStatus.success) {
      throw new Error("Klarte ikke sende glemt passord-lenke.");
    }
    return {};
  }

  async resetPassword({ request }: HttpContext) {
    const { resetId, resetToken, newPassword } = await request.validateUsing(
      passwordResetValidator,
    );
    const result = await getPasswordReset({
      resetId,
      resetToken,
    });

    if (!result.pendingPasswordReset) {
      return { message: `Klarte ikke sette nytt passord. ${result.message}` };
    }

    await PasswordService.setPassword(result.user.id, newPassword);

    await BlStorage.PendingPasswordResets.remove(
      result.pendingPasswordReset.id,
    );
    return {};
  }

  async validatePasswordReset({ request }: HttpContext) {
    const { resetId, resetToken } = await request.validateUsing(
      passwordResetValidValidator,
    );
    const result = await getPasswordReset({ resetId, resetToken });
    if (!result.pendingPasswordReset) {
      return { message: result.message };
    }
    return {};
  }
}
