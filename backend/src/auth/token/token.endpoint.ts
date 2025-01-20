import { RefreshToken } from "@backend/auth/token/refresh/refresh-token.js";
import { RefreshTokenValidator } from "@backend/auth/token/refresh/refresh-token.validator.js";
import { TokenHandler } from "@backend/auth/token/token.handler.js";
import { ApiPath } from "@backend/config/api-path.js";
import { SEResponseHandler } from "@backend/response/se.response.handler.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Router } from "express";

export class TokenEndpoint {
  private apiPath: ApiPath;
  private refreshTokenValidator: RefreshTokenValidator;

  constructor(
    private router: Router,
    private resHandler: SEResponseHandler,
    private tokenHandler: TokenHandler,
  ) {
    this.apiPath = new ApiPath();
    this.createPostEndpoint();
    this.refreshTokenValidator = new RefreshTokenValidator();
  }

  createPostEndpoint() {
    this.router.post(this.apiPath.createPath("token"), (request, res) => {
      if (request.body && request.body["refreshToken"]) {
        this.refreshTokenValidator.validate(request.body["refreshToken"]).then(
          // @ts-expect-error fixme: auto ignored
          (refreshToken: RefreshToken) => {
            this.tokenHandler.createTokens(refreshToken.username).then(
              (jwTokens: { accessToken: string; refreshToken: string }) => {
                this.resHandler.sendResponse(
                  res,
                  new BlapiResponse([
                    { accessToken: jwTokens.accessToken },
                    { refreshToken: jwTokens.refreshToken },
                  ]),
                );
              },
              (createTokenError: BlError) => {
                this.resHandler.sendErrorResponse(
                  res,
                  new BlError("could not create tokens")
                    .store("oldRefreshToken", request.body["refreshToken"])
                    .code(906)
                    .add(createTokenError),
                );
              },
            );
          },
          (refreshTokenValidationError: BlError) => {
            this.resHandler.sendErrorResponse(
              res,
              new BlError("refreshToken not valid")
                .code(909)
                .add(refreshTokenValidationError),
            );
          },
        );
      } else {
        this.resHandler.sendErrorResponse(
          res,
          new BlError("bad format").code(701),
        );
      }
    });
  }
}
