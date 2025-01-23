import LocalLoginValidator from "@backend/express/auth/local/local-login.validator.js";
import TokenHandler from "@backend/express/auth/token/token.handler.js";
import { createPath } from "@backend/express/config/api-path.js";
import BlResponseHandler from "@backend/express/response/bl-response.handler.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Response, Router } from "express";
import passport from "passport";
import { Strategy } from "passport-local";

function createPassportStrategy() {
  passport.use(
    new Strategy((username, password, done) => {
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

function createAuthLogin(router: Router) {
  router.post(createPath("auth/local/login"), (request, res, next) => {
    passport.authenticate(
      "local",
      (
        error: unknown,
        jwTokens: { accessToken: string; refreshToken: string },
        blError: BlError,
      ) => {
        if (blError && !(blError instanceof BlError)) {
          blError = new BlError("unknown error").code(500);
          return BlResponseHandler.sendErrorResponseExpress(res, blError);
        }

        if (error) {
          return next(error);
        }

        if (!jwTokens) {
          return BlResponseHandler.sendErrorResponseExpress(res, blError);
        }

        request.login(jwTokens, (error) => {
          if (error) return next(error);
          respondWithTokens(res, {
            accessToken: jwTokens.accessToken,
            refreshToken: jwTokens.refreshToken,
          });
        });
      },
    )(request, res, next);
  });
}

function respondWithTokens(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) {
  return BlResponseHandler.sendResponseExpress(
    res,
    new BlapiResponse([
      { documentName: "refreshToken", data: tokens.refreshToken },
      { documentName: "accessToken", data: tokens.accessToken },
    ]),
  );
}

function createAuthRegister(router: Router) {
  router.post(createPath("auth/local/register"), (request, res) => {
    LocalLoginValidator.create(
      request.body.username,
      request.body.password,
    ).then(
      () => {
        TokenHandler.createTokens(request.body.username).then(
          (tokens: { accessToken: string; refreshToken: string }) => {
            respondWithTokens(res, tokens);
          },
          (createTokensError: BlError) => {
            BlResponseHandler.sendErrorResponseExpress(
              res,
              new BlError("could not create tokens")
                .add(createTokensError)
                .code(906),
            );
          },
        );
      },
      (loginValidatorCreateError: BlError) => {
        if (loginValidatorCreateError.getCode() === 903) {
          BlResponseHandler.sendErrorResponseExpress(
            res,
            loginValidatorCreateError,
          );
        } else {
          BlResponseHandler.sendErrorResponseExpress(
            res,
            new BlError("could not create user")
              .add(loginValidatorCreateError)
              .code(907),
          );
        }
      },
    );
  });
}

const LocalAuth = {
  createRouter: () => {
    const router: Router = Router();
    createPassportStrategy();
    createAuthRegister(router);
    createAuthLogin(router);
    return router;
  },
};
export default LocalAuth;
