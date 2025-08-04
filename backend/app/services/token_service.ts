import jwt, { JwtPayload } from "jsonwebtoken";

import { APP_CONFIG } from "#services/legacy/application-config";
import { StorageService } from "#services/storage_service";
import { UserService } from "#services/user_service";
import env from "#start/env";

const TokenService = {
  async createTokens(username: string) {
    const user = await UserService.getByUsername(username);
    if (!user) return null;

    await StorageService.Users.update(user.id, {
      $set: {
        "login.lastTokenIssuedAt": new Date(),
      },
    });

    const PAYLOAD = {
      iss: APP_CONFIG.token.access.iss,
      aud: APP_CONFIG.token.access.aud,
      iat: Math.floor(Date.now() / 1000),
      sub: user.blid,
      username: username,
    } as const satisfies JwtPayload;
    const EXPIRY = {
      expiresIn: APP_CONFIG.token.refresh.expiresIn,
    } as const;

    return {
      accessToken: jwt.sign(
        {
          ...PAYLOAD,
          permission: user.permission,
          details: user.userDetail,
        },
        env.get("ACCESS_TOKEN_SECRET"),
        EXPIRY,
      ),
      refreshToken: jwt.sign(PAYLOAD, env.get("REFRESH_TOKEN_SECRET"), EXPIRY),
    };
  },
};
export default TokenService;
