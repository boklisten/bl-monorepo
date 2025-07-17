import { HttpContext } from "@adonisjs/core/http";
import validator from "validator";

import TokenHandler from "#services/auth/token/token.handler";
import UserHandler from "#services/auth/user/user.handler";
import BlCrypto from "#services/config/bl-crypto";
import { PasswordService } from "#services/password_service";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import {
  localAuthValidator,
  registerValidator,
} from "#validators/auth_validators";

async function normalizeUsername(username: string) {
  if (!validator.isMobilePhone(username)) {
    return username;
  }
  const databaseQuery = new SEDbQuery();
  databaseQuery.stringFilters = [
    { fieldName: "phone", value: username.slice(-8) },
  ];
  try {
    const [details] = await BlStorage.UserDetails.getByQuery(databaseQuery);
    return details?.email ?? "";
  } catch {
    return "unknwon@example.org";
  }
}

export default class LocalController {
  async login({ request }: HttpContext) {
    const { username, password } =
      await request.validateUsing(localAuthValidator);
    const normalizedUsername = await normalizeUsername(username);

    const user = await UserHandler.getOrNull(normalizedUsername);

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

    return {
      tokens: await TokenHandler.createTokens(normalizedUsername),
    };
  }

  async register({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(registerValidator);

    await UserHandler.create({
      username: email,
      password,
      provider: "local",
      providerId: BlCrypto.random(),
    });
    return await TokenHandler.createTokens(email);
  }
}
