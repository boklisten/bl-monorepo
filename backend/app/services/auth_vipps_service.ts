import { HttpContext } from "@adonisjs/core/http";

import TokenHandler from "#services/auth/token/token.handler";
import { BlStorage } from "#services/storage/bl-storage";
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

export const AuthVippsService = {
  async handleCallback(ctx: HttpContext) {
    const social = ctx.ally.use("vipps");

    let error: AuthSocialError | null = null;
    const { ACCESS_DENIED, EXPIRED, ERROR } = AUTH_SOCIAL_ERROR;

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

    const existingUserDetail = await UserDetailService.getByPhoneNumber(
      user.phoneNumber,
    );
    const email = existingUserDetail?.email ?? user.email;
    const existingUser = await UserService.getByUsername(email);
    if (existingUser) {
      await UserService.connectProviderToUser(existingUser, "vipps", user.id);
      if (!existingUserDetail) {
        const addedUserDetail = await UserDetailService.createVippsUserDetail(
          user,
          existingUser.blid,
        );
        await BlStorage.Users.update(existingUser.id, {
          userDetail: addedUserDetail.id,
        });
      }
      await BlStorage.Users.update(existingUser.id, {
        $set: {
          "login.vipps.lastLogin": new Date(),
        },
      });
    } else {
      await UserService.createVippsUser(user);
    }

    const { accessToken, refreshToken } =
      await TokenHandler.createTokens(email);

    return ctx.response.redirect(
      `${env.get(
        "NEXT_CLIENT_URI",
      )}auth/token?access_token=${accessToken}&refresh_token=${refreshToken}`,
    );
  },
};
