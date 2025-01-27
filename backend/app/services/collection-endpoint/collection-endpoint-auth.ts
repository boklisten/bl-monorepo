import { HttpContext } from "@adonisjs/core/http";
import passport from "passport";

import { PermissionService } from "#services/auth/permission.service";
import { isNotNullish } from "#services/helper/typescript-helpers";
import { BlEndpointRestriction } from "#services/types/bl-collection";
import { BlError } from "#shared/bl-error/bl-error";
import { AccessToken } from "#shared/token/access-token";

function validateAuth(
  restriction: BlEndpointRestriction | undefined,
  accessToken: AccessToken,
) {
  if (!accessToken) {
    throw new BlError("accessToken invalid").code(910);
  }

  if (
    restriction &&
    !PermissionService.isPermissionEqualOrOver(
      accessToken.permission,
      restriction.permission,
    )
  ) {
    throw new BlError(
      `user "${accessToken.sub}" with permission "${accessToken.permission}" does not have access to this endpoint`,
    ).code(904);
  }

  return true;
}

function authenticate(
  restriction: BlEndpointRestriction | undefined,
  ctx: HttpContext,
): Promise<AccessToken | undefined> {
  return new Promise((resolve, reject) => {
    const authHeader = ctx.request.headers()["authorization"];
    if (restriction || isNotNullish(authHeader)) {
      // it is a restriction on this endpoint and authentication is required, also try if there are sent with a auth header
      passport.authenticate(
        "jwt",
        (_error: unknown, tokens: { accessToken: AccessToken }) => {
          try {
            validateAuth(restriction, tokens.accessToken);
            return resolve(tokens.accessToken);
          } catch (error) {
            // if authorization tokens is not valid
            return reject(error);
          }
        },
      )({ headers: { authorization: authHeader } });
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
