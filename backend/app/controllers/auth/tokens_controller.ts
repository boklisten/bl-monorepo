import { HttpContext } from "@adonisjs/core/http";
import jwt from "jsonwebtoken";

import BlResponseHandler from "#services/legacy/bl-response.handler";
import TokenService from "#services/token_service";
import { BlError } from "#shared/bl-error";
import { BlapiResponse } from "#shared/blapi-response";
import env from "#start/env";
import { tokenValidator } from "#validators/auth_validators";

export default class TokensController {
  // @deprecated Only used for bl-web and bl-admin, use token for new adoptions
  async legacyToken(ctx: HttpContext) {
    const { refreshToken } = await ctx.request.validateUsing(tokenValidator);
    try {
      const verifiedRefreshToken = jwt.verify(
        refreshToken,
        env.get("REFRESH_TOKEN_SECRET"),
      );

      if (typeof verifiedRefreshToken === "string") {
        throw new Error("Invalid refresh token");
      }

      try {
        const tokens = await TokenService.createTokens(
          verifiedRefreshToken["username"],
        );

        if (!tokens) {
          throw new Error("Could not create tokens");
        }

        return new BlapiResponse([
          { accessToken: tokens.accessToken },
          { refreshToken: tokens.refreshToken },
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

  async token(ctx: HttpContext) {
    const { refreshToken } = await ctx.request.validateUsing(tokenValidator);
    try {
      const verifiedRefreshToken = jwt.verify(
        refreshToken,
        env.get("REFRESH_TOKEN_SECRET"),
      );

      if (typeof verifiedRefreshToken === "string") {
        ctx.response.unauthorized();
        return;
      }

      const tokens = await TokenService.createTokens(
        verifiedRefreshToken["username"],
      );

      if (!tokens) {
        ctx.response.unauthorized();
        return;
      }

      return tokens;
    } catch {
      ctx.response.unauthorized();
      return;
    }
  }
}
