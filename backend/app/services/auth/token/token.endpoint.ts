import router from "@adonisjs/core/services/router";

import RefreshTokenValidator from "#services/auth/token/refresh/refresh-token.validator";
import TokenHandler from "#services/auth/token/token.handler";
import { createPath } from "#services/config/api-path";
import BlResponseHandler from "#services/response/bl-response.handler";
import { RefreshToken } from "#services/types/refresh-token";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";

function generateEndpoint() {
  router.post(createPath("token"), (ctx) => {
    const refreshToken = ctx.request.body()["refreshToken"];
    if (refreshToken) {
      RefreshTokenValidator.validate(refreshToken).then(
        // @ts-expect-error fixme: auto ignored
        (validatedRefreshToken: RefreshToken) => {
          TokenHandler.createTokens(validatedRefreshToken.username).then(
            (jwTokens: { accessToken: string; refreshToken: string }) => {
              BlResponseHandler.sendResponse(
                ctx,
                new BlapiResponse([
                  { accessToken: jwTokens.accessToken },
                  { refreshToken: jwTokens.refreshToken },
                ]),
              );
            },
            (createTokenError: BlError) => {
              BlResponseHandler.sendErrorResponse(
                ctx,
                new BlError("could not create tokens")
                  .store("oldRefreshToken", refreshToken)
                  .code(906)
                  .add(createTokenError),
              );
            },
          );
        },
        (refreshTokenValidationError: BlError) => {
          BlResponseHandler.sendErrorResponse(
            ctx,
            new BlError("refreshToken not valid")
              .code(909)
              .add(refreshTokenValidationError),
          );
        },
      );
    } else {
      BlResponseHandler.sendErrorResponse(
        ctx,
        new BlError("bad format").code(701),
      );
    }
  });
  return router;
}
const TokenEndpoint = {
  generateEndpoint,
};
export default TokenEndpoint;
