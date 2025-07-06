import { HttpContext } from "@adonisjs/core/http";
import jwt, { JwtPayload } from "jsonwebtoken";

import { PermissionService } from "#services/auth/permission.service";
import { APP_CONFIG } from "#services/config/application-config";
import { BlEndpointRestriction } from "#services/types/bl-collection";
import { BlError } from "#shared/bl-error/bl-error";
import env from "#start/env";

function validateAuth(
  restriction: BlEndpointRestriction | undefined,
  accessToken: JwtPayload,
) {
  if (
    restriction &&
    !PermissionService.isPermissionEqualOrOver(
      accessToken["permission"],
      restriction.permission,
    )
  ) {
    throw new BlError(
      `user "${accessToken.sub}" with permission "${accessToken["permission"]}" does not have access to this endpoint`,
    ).code(904);
  }

  return true;
}

function extractBearerToken(authHeader?: string) {
  if (!authHeader) return "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return "";
  return token;
}

function verifyAccessToken(token: string) {
  const decoded = jwt.verify(token, env.get("ACCESS_TOKEN_SECRET"), {
    issuer: APP_CONFIG.token.access.iss,
    audience: APP_CONFIG.token.access.aud,
  });
  if (typeof decoded === "string") throw new Error("token is not a valid jwt");
  return decoded;
}

function authenticate(
  restriction: BlEndpointRestriction | undefined,
  ctx: HttpContext,
): Promise<JwtPayload | undefined> {
  return new Promise((resolve, reject) => {
    if (restriction) {
      const authHeader = ctx.request.headers().authorization;
      try {
        const accessToken = verifyAccessToken(extractBearerToken(authHeader));
        validateAuth(restriction, accessToken);
        resolve(accessToken);
      } catch {
        reject(new BlError("authentication failed").code(910));
      }
    } else {
      // no authentication needed
      return resolve(undefined);
    }
  });
}

const CollectionEndpointAuth = {
  authenticate,
};
export default CollectionEndpointAuth;
