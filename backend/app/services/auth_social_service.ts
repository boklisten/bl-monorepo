import { SocialProviders } from "@adonisjs/ally/types";
import { HttpContext } from "@adonisjs/core/http";

import { retrieveRefererPath } from "#services/config/api-path";
import { BlStorage } from "#services/storage/bl-storage";
import TokenService from "#services/token_service";
import { UserDetailService } from "#services/user_detail_service";
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
  } else if (social.stateMisMatch()) {
    error = EXPIRED;
  } else if (social.hasError()) {
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

  const socialUser = {
    provider,
    providerId: user.id,
    email: user.email,
    emailConfirmed: user.emailVerificationState === "verified",
  };

  const existingUser = await UserService.getByUsername(user.email);
  if (existingUser) {
    await UserService.connectProviderToUser(existingUser, provider, user.id);
    const existingUserDetail = await UserDetailService.getByEmail(user.email);
    if (!existingUserDetail) {
      const addedUserDetail = await UserDetailService.createSocialUserDetail(
        socialUser,
        existingUser.blid,
      );
      await BlStorage.Users.update(existingUser.id, {
        userDetail: addedUserDetail.id,
      });
    }
    await BlStorage.Users.update(existingUser.id, {
      $set: {
        [`login.${provider}.lastLogin`]: new Date(),
      },
    });
  } else {
    await UserService.createSocialUser(socialUser);
  }

  const tokens = await TokenService.createTokens(user.email);

  if (!tokens) {
    redirectToAuthFailedPage(ctx, ERROR);
    return;
  }

  return ctx.response.redirect(
    `${
      retrieveRefererPath(ctx.request.headers()) ?? env.get("NEXT_CLIENT_URI")
    }auth/token?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`,
  );
}

const AuthSocialService = {
  handleCallback,
};

export default AuthSocialService;
