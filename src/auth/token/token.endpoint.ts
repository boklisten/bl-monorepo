import { BlapiResponse, BlError } from "@boklisten/bl-model";
import { Router } from "express";

import { RefreshToken } from "@/auth/token/refresh/refresh-token";
import { RefreshTokenValidator } from "@/auth/token/refresh/refresh-token.validator";
import { TokenHandler } from "@/auth/token/token.handler";
import { ApiPath } from "@/config/api-path";
import { SEResponseHandler } from "@/response/se.response.handler";

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
