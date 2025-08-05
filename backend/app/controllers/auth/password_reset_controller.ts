import { HttpContext } from "@adonisjs/core/http";
import hash from "@adonisjs/core/services/hash";

import CryptoService from "#services/crypto_service";
import DispatchService from "#services/dispatch_service";
import { PasswordService } from "#services/password_service";
import { StorageService } from "#services/storage_service";
import { UserDetailService } from "#services/user_detail_service";
import { UserService } from "#services/user_service";
import { PendingPasswordReset } from "#shared/pending-password-reset";
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
    pendingPasswordReset =
      await StorageService.PendingPasswordResets.get(resetId);
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

  const userDetail = await UserDetailService.getByEmail(
    pendingPasswordReset.email,
  );
  if (!userDetail) {
    throw new Error("Brukeren finnes ikke");
  }

  let user = await UserService.getByUserDetailsId(userDetail.id);
  if (!user) {
    user = await UserService.createLocalUser(
      userDetail.id,
      CryptoService.random(),
    );
  }

  return { user, pendingPasswordReset };
}

export default class PasswordResetController {
  async requestPasswordReset({ request }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator);
    const token = CryptoService.random();
    const tokenHash = await hash.make(token);

    const userDetail = await UserDetailService.getByEmail(email);
    if (!userDetail) {
      return {
        message:
          "E-posten du har oppgitt er ikke tilknyttet noen bruker. Du kan forsøke et annet brukernavn, eller lage en ny bruker ved å trykke på 'registrer deg'",
      };
    }

    const passwordReset = await StorageService.PendingPasswordResets.add({
      email,
      tokenHash,
    });

    const mailStatus = await DispatchService.sendPasswordReset({
      email,
      resetId: passwordReset.id,
      token,
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

    await StorageService.PendingPasswordResets.remove(
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
