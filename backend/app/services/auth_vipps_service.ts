import { HttpContext } from "@adonisjs/core/http";

import { BlStorage } from "#services/storage/bl-storage";
import TokenService from "#services/token_service";
import { UserDetailService } from "#services/user_detail_service";
import { UserService } from "#services/user_service";
import { AUTH_VIPPS_ERROR, AuthVippsError } from "#shared/auth_vipps_error";
import env from "#start/env";

function redirectToAuthFailedPage(ctx: HttpContext, reason: string) {
  ctx.response.redirect(
    `${env.get("NEXT_CLIENT_URI")}auth/failure?reason=${reason}`,
  );
}

export const AuthVippsService = {
  async handleCallback(ctx: HttpContext) {
    const vipps = ctx.ally.use("vipps");

    let error: AuthVippsError | null = null;
    const { ACCESS_DENIED, EXPIRED, ERROR } = AUTH_VIPPS_ERROR;

    if (vipps.accessDenied()) {
      error = ACCESS_DENIED;
    } else if (vipps.stateMisMatch()) {
      error = EXPIRED;
    } else if (vipps.hasError()) {
      error = ERROR;
    }

    if (error) {
      redirectToAuthFailedPage(ctx, error);
      return;
    }

    const vippsUser = await vipps.user();

    const userDetail = await UserDetailService.getByPhoneNumber(
      vippsUser.phoneNumber,
    );
    const email = userDetail?.email ?? vippsUser.email;
    const user = await UserService.getByUsername(email);
    if (user) {
      if (!userDetail) {
        const addedUserDetail = await UserDetailService.createVippsUserDetail(
          vippsUser,
          user.blid,
        );
        await BlStorage.Users.update(user.id, {
          userDetail: addedUserDetail.id,
        });
      }
      await BlStorage.Users.update(user.id, {
        $set: {
          "login.vipps.userId": vippsUser.id,
          "login.vipps.lastLogin": new Date(),
        },
      });
    } else {
      await UserService.createVippsUser(vippsUser);
    }

    const tokens = await TokenService.createTokens(email);

    if (!tokens) {
      redirectToAuthFailedPage(ctx, ERROR);
      return;
    }

    return ctx.response.redirect(
      `${env.get(
        "NEXT_CLIENT_URI",
      )}auth/token?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`,
    );
  },
};
