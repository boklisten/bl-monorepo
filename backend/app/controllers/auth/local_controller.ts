import { HttpContext } from "@adonisjs/core/http";
import validator from "validator";

import UnauthorizedException from "#exceptions/unauthorized_exception";
import HashedPasswordGenerator from "#services/auth/local/hashed-password-generator";
import TokenHandler from "#services/auth/token/token.handler";
import UserHandler from "#services/auth/user/user.handler";
import BlCrypto from "#services/config/bl-crypto";
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

async function getLocalLogin(username: string) {
  try {
    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [{ fieldName: "username", value: username }];

    const [localLogin] = await BlStorage.LocalLogins.getByQuery(databaseQuery);
    return localLogin ?? null;
  } catch {
    return null;
  }
}

export default class LocalController {
  async login({ request }: HttpContext) {
    const { username, password } =
      await request.validateUsing(localAuthValidator);
    const normalizedUsername = await normalizeUsername(username);

    const localLogin = await getLocalLogin(normalizedUsername);

    if (!localLogin)
      throw new UnauthorizedException("Feil brukernavn eller passord");

    const candidate = await BlCrypto.hash(password, localLogin.salt);

    if (!BlCrypto.timingSafeEqual(candidate, localLogin.hashedPassword))
      throw new UnauthorizedException("Feil brukernavn eller passord");

    return await TokenHandler.createTokens(normalizedUsername);
  }

  async register({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(registerValidator);

    const { hashedPassword, salt } =
      await HashedPasswordGenerator.generate(password);
    await BlStorage.LocalLogins.add({
      username: email,
      hashedPassword,
      salt,
    });

    await UserHandler.create(email, "local", BlCrypto.random());

    return await TokenHandler.createTokens(email);
  }
}
