import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import TokenHandler from "#services/auth/token/token.handler";
import { PasswordService } from "#services/password_service";
import { BlStorage } from "#services/storage/bl-storage";
import { User } from "#services/types/user";
import { UserDetailService } from "#services/user_detail_service";
import { UserService } from "#services/user_service";
import {
  localAuthValidator,
  registerValidator,
} from "#validators/auth_validators";

export default class LocalController {
  async login({ request }: HttpContext) {
    const { username, password } =
      await request.validateUsing(localAuthValidator);

    let user: User | null = null;
    if (vine.helpers.isEmail(username)) {
      user = await UserService.getByUsername(username);
    } else {
      const userDetail = await UserDetailService.getByPhoneNumber(username);
      if (userDetail) {
        user = await UserService.getByUsername(userDetail.email);
      }
    }

    if (!user) {
      return {
        message:
          "Brukernavnet du har oppgitt er ikke tilknyttet noen bruker. Du kan forsøke et annet brukernavn, eller lage en ny bruker ved å trykke på 'registrer deg'",
      };
    }

    if (!user.login.local) {
      return {
        message:
          "Brukeren du forsøker å logge inn med har ikke satt opp passord-innlogging. Du kan forsøke å logge inn med Google eller Facebook, eller et lage et nytt passord ved å trykke på 'glemt passord'",
      };
    }
    const isCorrectPassword = await PasswordService.verifyPassword({
      userId: user.id,
      password,
      hashedPassword: user.login.local.hashedPassword,
      salt: user.login.local.salt,
    });

    if (!isCorrectPassword) {
      return {
        message:
          "Passordet du har oppgitt stemmer ikke. Du kan prøve et annet passord, eller et lage et nytt ved å trykke på 'glemt passord'",
      };
    }
    await BlStorage.Users.update(user.id, {
      $set: {
        "login.local.lastLogin": new Date(),
        "login.lastTokenIssuedAt": new Date(),
      },
    });

    return {
      tokens: await TokenHandler.createTokens(user.username),
    };
  }

  async register({ request }: HttpContext) {
    const registerData = await request.validateUsing(registerValidator);
    await UserService.createLocalUser(registerData);
    return await TokenHandler.createTokens(registerData.email);
  }
}
