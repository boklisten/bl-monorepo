import { BlapiResponse, BlError } from "@boklisten/bl-model";
import { Response, Router } from "express";
import passport from "passport";
import { Strategy } from "passport-local";

import { LocalLoginValidator } from "@/auth/local/local-login.validator";
import { TokenHandler } from "@/auth/token/token.handler";
import { ApiPath } from "@/config/api-path";
import { SEResponseHandler } from "@/response/se.response.handler";

export class LocalAuth {
  apiPath: ApiPath;

  constructor(
    router: Router,
    localLoginValidator: LocalLoginValidator,
    private resHandler: SEResponseHandler,
    private tokenHandler: TokenHandler,
  ) {
    this.apiPath = new ApiPath();
    this.createPassportStrategy(localLoginValidator);
    this.createAuthRegister(router, localLoginValidator);
    this.createAuthLogin(router);
  }

  private createPassportStrategy(localLoginValidator: LocalLoginValidator) {
    passport.use(
      new Strategy((username, password, done) => {
        const normalizedUsername = username.toLowerCase().replace(" ", "");
        localLoginValidator.validate(normalizedUsername, password).then(
          () => {
            this.tokenHandler.createTokens(normalizedUsername).then(
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
            if (
              validateError.getCode() === 908 ||
              validateError.getCode() === 901 ||
              validateError.getCode() === 702
            ) {
              return done(
                null,
                false,
                new BlError("username or password is wrong")
                  .code(908)
                  .add(validateError),
              );
            } else {
              return done(
                null,
                false,
                new BlError("could not login").code(900).add(validateError),
              );
            }
          },
        );
      }),
    );
  }

  private createAuthLogin(router: Router) {
    router.post(
      this.apiPath.createPath("auth/local/login"),
      (req, res, next) => {
        passport.authenticate(
          "local",
          (
            error: unknown,
            jwTokens: { accessToken: string; refreshToken: string },
            blError: BlError,
          ) => {
            if (blError) {
              if (!(blError instanceof BlError)) {
                blError = new BlError("unknown error").code(500);
                return this.resHandler.sendErrorResponse(res, blError);
              }
            }

            if (error) {
              return next(error);
            }

            if (!jwTokens) {
              return this.resHandler.sendErrorResponse(res, blError);
            }

            req.login(jwTokens, (error) => {
              if (error) return next(error);
              this.respondWithTokens(res, {
                accessToken: jwTokens.accessToken,
                refreshToken: jwTokens.refreshToken,
              });
            });
          },
        )(req, res, next);
      },
    );
  }

  private respondWithTokens(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    return this.resHandler.sendResponse(
      res,
      new BlapiResponse([
        { documentName: "refreshToken", data: tokens.refreshToken },
        { documentName: "accessToken", data: tokens.accessToken },
      ]),
    );
  }

  private createAuthRegister(
    router: Router,
    localLoginValidator: LocalLoginValidator,
  ) {
    router.post(this.apiPath.createPath("auth/local/register"), (req, res) => {
      localLoginValidator.create(req.body.username, req.body.password).then(
        () => {
          this.tokenHandler.createTokens(req.body.username).then(
            (tokens: { accessToken: string; refreshToken: string }) => {
              this.respondWithTokens(res, tokens);
            },
            (createTokensError: BlError) => {
              this.resHandler.sendErrorResponse(
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
            this.resHandler.sendErrorResponse(res, loginValidatorCreateError);
          } else {
            this.resHandler.sendErrorResponse(
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
}
