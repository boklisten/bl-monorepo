import { HttpContext } from "@adonisjs/core/http";
import validator from "validator";

import UnauthorizedException from "#exceptions/unauthorized_exception";
import LocalLoginValidator from "#services/auth/local/local-login.validator";
import TokenHandler from "#services/auth/token/token.handler";
import BlCrypto from "#services/config/bl-crypto";
import { SEDbQuery } from "#services/query/se.db-query";
import BlResponseHandler from "#services/response/bl-response.handler";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { localAuthValidator } from "#validators/auth_validators";

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

  async register(ctx: HttpContext) {
    const { username, password } =
      await ctx.request.validateUsing(localAuthValidator);
    return new Promise((resolve, reject) => {
      LocalLoginValidator.create(username, password).then(
        () => {
          TokenHandler.createTokens(username).then(
            (tokens: { accessToken: string; refreshToken: string }) => {
              resolve(
                new BlapiResponse([
                  { documentName: "refreshToken", data: tokens.refreshToken },
                  { documentName: "accessToken", data: tokens.accessToken },
                ]),
              );
            },
            (createTokensError: BlError) => {
              resolve(
                BlResponseHandler.createErrorResponse(
                  ctx,
                  new BlError("could not create tokens")
                    .add(createTokensError)
                    .code(906),
                ),
              );
            },
          );
        },
        (loginValidatorCreateError: BlError) => {
          if (loginValidatorCreateError.getCode() === 903) {
            resolve(
              BlResponseHandler.createErrorResponse(
                ctx,
                loginValidatorCreateError,
              ),
            );
          } else {
            resolve(
              BlResponseHandler.createErrorResponse(
                ctx,
                new BlError("could not create user")
                  .add(loginValidatorCreateError)
                  .code(907),
              ),
            );
          }
          reject(loginValidatorCreateError);
        },
      );
    });
  }
}
