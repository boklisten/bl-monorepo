import { RefreshToken } from "@backend/auth/token/refresh/refresh-token";
import { RefreshTokenValidator } from "@backend/auth/token/refresh/refresh-token.validator";
import { TokenHandler } from "@backend/auth/token/token.handler";
import { ApiPath } from "@backend/config/api-path";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
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
    this.router.post(this.apiPath.createPath("token"), (req, res) => {
      if (req.body && req.body["refreshToken"]) {
        this.refreshTokenValidator.validate(req.body["refreshToken"]).then(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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
                    .store("oldRefreshToken", req.body["refreshToken"])
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
