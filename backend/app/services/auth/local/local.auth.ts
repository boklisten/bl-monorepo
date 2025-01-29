import router from "@adonisjs/core/services/router";
import passport from "passport";
import { Strategy } from "passport-local";

import LocalLoginValidator from "#services/auth/local/local-login.validator";
import TokenHandler from "#services/auth/token/token.handler";
import BlResponseHandler from "#services/response/bl-response.handler";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";

function createPassportStrategy() {
  passport.use(
    new Strategy({ session: false }, (username, password, done) => {
      const normalizedUsername = username.toLowerCase().replace(" ", "");
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

function createAuthLogin() {
  router.post("/auth/local/login", (ctx) => {
    return new Promise((resolve) => {
      passport.authenticate(
        "local",
        (
          error: unknown,
          jwTokens: { accessToken: string; refreshToken: string },
          blError: BlError,
        ) => {
          if (blError && !(blError instanceof BlError)) {
            blError = new BlError("unknown error").code(500);
            resolve(BlResponseHandler.createErrorResponse(ctx, blError));
          }

          if (error) {
            throw error;
          }

          if (!jwTokens) {
            resolve(BlResponseHandler.createErrorResponse(ctx, blError));
          }

          resolve(
            new BlapiResponse([
              { documentName: "refreshToken", data: jwTokens.refreshToken },
              { documentName: "accessToken", data: jwTokens.accessToken },
            ]),
          );
        },
      )({
        body: {
          username: ctx.request.body()["username"],
          password: ctx.request.body()["password"],
        },
      });
    });
  });
}

function createAuthRegister() {
  router.post("/auth/local/register", (ctx) => {
    return new Promise((resolve, reject) => {
      const username = ctx.request.body()["username"];
      LocalLoginValidator.create(
        ctx.request.body()["username"],
        ctx.request.body()["password"],
      ).then(
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
  });
}

const LocalAuth = {
  generateEndpoints: () => {
    createPassportStrategy();
    createAuthRegister();
    createAuthLogin();
  },
};
export default LocalAuth;
