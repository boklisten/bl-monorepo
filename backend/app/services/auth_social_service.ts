import { SocialProviders } from "@adonisjs/ally/types";
import { HttpContext } from "@adonisjs/core/http";

import TokenHandler from "#services/auth/token/token.handler";
import UserHandler from "#services/auth/user/user.handler";
import { retrieveRefererPath } from "#services/config/api-path";
import env from "#start/env";

async function handleCallback(ctx: HttpContext) {
  const provider: keyof SocialProviders = ctx.params["provider"];
  const social = ctx.ally.use(provider);

  if (social.accessDenied() || social.stateMisMatch() || social.hasError()) {
    return ctx.response.redirect(`${env.get("CLIENT_URI")}auth/social/failure`);
  }

  const user = await social.user();

  const existingUser = await UserHandler.getOrNull(user.email);
  if (existingUser) {
    await UserHandler.connectProviderToUser(existingUser, provider, user.id);
  } else {
    await UserHandler.create(user.email, provider, user.id);
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
