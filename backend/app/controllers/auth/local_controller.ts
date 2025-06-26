import { HttpContext } from "@adonisjs/core/http";
import passport from "passport";
import { Strategy } from "passport-local";
import validator from "validator";

import LocalLoginValidator from "#services/auth/local/local-login.validator";
import TokenHandler from "#services/auth/token/token.handler";
import { SEDbQuery } from "#services/query/se.db-query";
import BlResponseHandler from "#services/response/bl-response.handler";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { localAuthValidator } from "#validators/local_auth";

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

async function authenticate(username: string, password: string) {
  return new Promise<{
    accessToken?: string;
    refreshToken?: string;
    statusCode: number;
  }>((resolve) => {
    try {
      passport.authenticate(
        "local",
        (
          error: unknown,
          jwTokens: { accessToken: string; refreshToken: string },
          blError: BlError,
        ) => {
          if (error || (blError && !(blError instanceof BlError))) {
            resolve({ statusCode: 500 });
          }

          if (!jwTokens) {
            resolve({ statusCode: 401 });
          }

          resolve({
            accessToken: jwTokens.accessToken,
            refreshToken: jwTokens.refreshToken,
            statusCode: 200,
          });
        },
      )({
        body: {
          username,
          password,
        },
      });
    } catch {
      resolve({ statusCode: 500 });
    }
  });
}

export default class LocalController {
  constructor() {
    passport.use(
      new Strategy({ session: false }, async (username, password, done) => {
        const normalizedUsername = await normalizeUsername(username);
        LocalLoginValidator.validate(normalizedUsername, password).then(
          () => {
            TokenHandler.createTokens(normalizedUsername).then(
              (tokens: { accessToken: string; refreshToken: string }) => {
                done(null, tokens);
              },
              (createTokensError: BlError) => {
                done(
                  null,
                  false,
                  new BlError("error when trying to create tokens")
                    .code(906)
                    .add(createTokensError),
                );
              },
            );
          },
          (validateError: BlError) => {
            return validateError.getCode() === 908 ||
              validateError.getCode() === 901 ||
              validateError.getCode() === 702
              ? done(
                  null,
                  false,
                  new BlError("username or password is wrong")
                    .code(908)
                    .add(validateError),
                )
              : done(
                  null,
                  false,
                  new BlError("could not login").code(900).add(validateError),
                );
          },
        );
      }),
    );
  }

  async login({ request, response }: HttpContext) {
    const { username, password } =
      await request.validateUsing(localAuthValidator);

    const { accessToken, refreshToken, statusCode } = await authenticate(
      username,
      password,
    );
    response.status(statusCode);
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
    return;
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
