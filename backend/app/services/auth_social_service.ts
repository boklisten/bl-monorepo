import { SocialProviders } from "@adonisjs/ally/types";
import { HttpContext } from "@adonisjs/core/http";

import TokenHandler from "#services/auth/token/token.handler";
import { retrieveRefererPath } from "#services/config/api-path";
import { UserService } from "#services/user_service";
import {
  AUTH_SOCIAL_ERROR,
  AuthSocialError,
} from "#shared/auth_social/auth_social_error";
import env from "#start/env";

function redirectToAuthFailedPage(ctx: HttpContext, reason: string) {
  ctx.response.redirect(
    `${env.get("NEXT_CLIENT_URI")}auth/failure?reason=${reason}`,
  );
}

async function handleCallback(ctx: HttpContext) {
  const provider: keyof SocialProviders = ctx.params["provider"];
  const social = ctx.ally.use(provider);

  let error: AuthSocialError | null = null;
  const { ACCESS_DENIED, EXPIRED, NO_EMAIL, ERROR } = AUTH_SOCIAL_ERROR;

  if (social.accessDenied()) {
    error = ACCESS_DENIED;
  }

  if (social.stateMisMatch()) {
    error = EXPIRED;
  }

  if (social.hasError()) {
    error = ERROR;
  }
  if (error) {
    redirectToAuthFailedPage(ctx, error);
    return;
  }

  const user = await social.user();
  if (!user.email) {
    redirectToAuthFailedPage(ctx, NO_EMAIL);
    return;
  }

  const existingUser = await UserService.getOrNull(user.email);
  if (existingUser) {
    await UserService.connectProviderToUser(existingUser, provider, user.id);
  } else {
    await UserService.createSocialUser({
      username: user.email,
      provider,
      providerId: user.id,
      emailConfirmed: user.emailVerificationState === "verified",
    });
  }

  const { accessToken, refreshToken } = await TokenHandler.createTokens(
    user.email,
  );

  return ctx.response.redirect(
    `${
      retrieveRefererPath(ctx.request.headers()) ?? env.get("CLIENT_URI")
    }auth/token?access_token=${accessToken}&refresh_token=${refreshToken}`,
  );
}

const AuthSocialService = {
  handleCallback,
};

export default AuthSocialService;
