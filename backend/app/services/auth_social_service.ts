import { SocialProviders } from "@adonisjs/ally/types";
import { HttpContext } from "@adonisjs/core/http";

import UserProvider from "#services/auth/user/user-provider";
import { retrieveRefererPath } from "#services/config/api-path";
import env from "#start/env";

async function handleCallback(ctx: HttpContext) {
  const provider: keyof SocialProviders = ctx.params["provider"];
  const social = ctx.ally.use(provider);

  if (social.accessDenied() || social.stateMisMatch() || social.hasError()) {
    return ctx.response.redirect(`${env.get("CLIENT_URI")}auth/social/failure`);
  }

  const user = await social.user();

  const { accessToken, refreshToken } = await UserProvider.loginOrCreate(
    user.email,
    provider,
    user.id,
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
