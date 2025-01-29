import { HttpContext } from "@adonisjs/core/http";

import RefreshTokenValidator from "#services/auth/token/refresh/refresh-token.validator";
import TokenHandler from "#services/auth/token/token.handler";
import BlResponseHandler from "#services/response/bl-response.handler";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { tokenValidator } from "#validators/token";

export default class TokensController {
  async token(ctx: HttpContext) {
    const { refreshToken } = await ctx.request.validateUsing(tokenValidator);
    const validatedRefreshToken =
      await RefreshTokenValidator.validate(refreshToken);
    try {
      try {
        const jwTokens = await TokenHandler.createTokens(
          validatedRefreshToken["username"],
        );
        return new BlapiResponse([
          { accessToken: jwTokens.accessToken },
          { refreshToken: jwTokens.refreshToken },
        ]);
      } catch (error) {
        return BlResponseHandler.createErrorResponse(
          ctx,
          new BlError("could not create tokens")
            .store("oldRefreshToken", refreshToken)
            .code(906)
            .add(error as BlError),
        );
      }
    } catch (error) {
      return BlResponseHandler.createErrorResponse(
        ctx,
        new BlError("refreshToken not valid").code(909).add(error as BlError),
      );
    }
  }
}
