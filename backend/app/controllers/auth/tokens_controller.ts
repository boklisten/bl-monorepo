import { HttpContext } from "@adonisjs/core/http";

import RefreshTokenValidator from "#services/auth/token/refresh/refresh-token.validator";
import TokenHandler from "#services/auth/token/token.handler";
import BlResponseHandler from "#services/response/bl-response.handler";
import { BlStorage } from "#services/storage/bl-storage";
import { UserService } from "#services/user_service";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { tokenValidator } from "#validators/auth_validators";

export default class TokensController {
  // @deprecated Only used for bl-web and bl-admin, use tokenV2 for new adoptions
  async token(ctx: HttpContext) {
    const { refreshToken } = await ctx.request.validateUsing(tokenValidator);
    const validatedRefreshToken =
      await RefreshTokenValidator.validate(refreshToken);
    try {
      try {
        const jwTokens = await TokenHandler.createTokens(
          validatedRefreshToken["username"],
        );
        const user = await UserService.getByUsername(
          validatedRefreshToken["username"],
        );
        if (user) {
          await BlStorage.Users.update(user.id, {
            $set: {
              "login.lastTokenIssuedAt": new Date(),
            },
          });
        }
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
  async tokenV2(ctx: HttpContext) {
    const { refreshToken } = await ctx.request.validateUsing(tokenValidator);
    const validatedRefreshToken =
      await RefreshTokenValidator.validate(refreshToken);
    const user = await UserService.getByUsername(
      validatedRefreshToken["username"],
    );
    if (user) {
      await BlStorage.Users.update(user.id, {
        $set: {
          "login.lastTokenIssuedAt": new Date(),
        },
      });
    }
    return await TokenHandler.createTokens(validatedRefreshToken["username"]);
  }
}
