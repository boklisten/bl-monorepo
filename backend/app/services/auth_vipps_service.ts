import { HttpContext } from "@adonisjs/core/http";
import logger from "@adonisjs/core/services/logger";

import BlidService from "#services/blid_service";
import { StorageService } from "#services/storage_service";
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

    // Try to find any matching user in any way possible
    let userDetail =
      (await UserDetailService.getByPhoneNumber(vippsUser.phoneNumber)) ??
      (await UserDetailService.getByEmail(vippsUser.email));

    let user =
      (await UserService.getByUsername(userDetail?.email)) ??
      (await UserService.getByUserDetailsId(userDetail?.id)) ??
      (await UserService.getByUsername(vippsUser.email));

    userDetail ??=
      (await StorageService.UserDetails.getOrNull(user?.userDetail)) ??
      (await UserDetailService.getByEmail(user?.username ?? ""));

    const blid =
      user?.blid ??
      userDetail?.blid ??
      BlidService.createUserBlid("vipps", vippsUser.id);

    try {
      if (!userDetail) {
        userDetail = await UserDetailService.createVippsUserDetail(
          vippsUser,
          blid,
        );
      }

      if (
        user &&
        (user.username !== userDetail.email ||
          user.userDetail !== userDetail.id ||
          user.blid !== userDetail.blid)
      ) {
        // user and userDetail are not in sync, so we set the user to match the userDetail
        await StorageService.Users.remove(user.id);

        user = await UserService.getByUserDetailsId(userDetail.id);
        if (user) await StorageService.Users.remove(user.id);

        user = await UserService.getByUsername(userDetail.email);
        if (user) await StorageService.Users.remove(user.id);

        user = null;
      }

      if (!user) {
        user = await UserService.createVippsUser(userDetail, vippsUser.id);
      }

      await StorageService.Users.update(user.id, {
        $set: {
          "login.vipps.userId": vippsUser.id,
          "login.vipps.lastLogin": new Date(),
        },
      });

      const tokens = await TokenService.createTokens(user.username);

      if (!tokens) {
        redirectToAuthFailedPage(ctx, ERROR);
        return;
      }

      ctx.response.redirect(
        `${env.get(
          "NEXT_CLIENT_URI",
        )}auth/token?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`,
      );
    } catch (error) {
      logger.error(error);
      redirectToAuthFailedPage(ctx, ERROR);
    }
  },
};
