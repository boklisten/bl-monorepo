import { HttpContext } from "@adonisjs/core/http";

import RefreshTokenValidator from "#services/auth/token/refresh/refresh-token.validator";
import TokenHandler from "#services/auth/token/token.handler";
import BlResponseHandler from "#services/response/bl-response.handler";
import { RefreshToken } from "#services/types/refresh-token";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { tokenValidator } from "#validators/token";

export default class TokensController {
  async token(ctx: HttpContext) {
    const { refreshToken } = await ctx.request.validateUsing(tokenValidator);
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
  }
}
