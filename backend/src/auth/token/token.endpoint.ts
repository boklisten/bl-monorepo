import RefreshTokenValidator from "@backend/auth/token/refresh/refresh-token.validator.js";
import TokenHandler from "@backend/auth/token/token.handler.js";
import { createPath } from "@backend/config/api-path.js";
import BlResponseHandler from "@backend/response/bl-response.handler.js";
import { RefreshToken } from "@backend/types/refresh-token.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Router } from "express";

function createRouter() {
  const router: Router = Router();
  router.post(createPath("token"), (request, res) => {
    if (request.body && request.body["refreshToken"]) {
      RefreshTokenValidator.validate(request.body["refreshToken"]).then(
        // @ts-expect-error fixme: auto ignored
        (refreshToken: RefreshToken) => {
          TokenHandler.createTokens(refreshToken.username).then(
            (jwTokens: { accessToken: string; refreshToken: string }) => {
              BlResponseHandler.sendResponse(
                res,
                new BlapiResponse([
                  { accessToken: jwTokens.accessToken },
                  { refreshToken: jwTokens.refreshToken },
                ]),
              );
            },
            (createTokenError: BlError) => {
              BlResponseHandler.sendErrorResponse(
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
          BlResponseHandler.sendErrorResponse(
            res,
            new BlError("refreshToken not valid")
              .code(909)
              .add(refreshTokenValidationError),
          );
        },
      );
    } else {
      BlResponseHandler.sendErrorResponse(
        res,
        new BlError("bad format").code(701),
      );
    }
  });
  return router;
}
const TokenEndpoint = {
  createRouter,
};
export default TokenEndpoint;
