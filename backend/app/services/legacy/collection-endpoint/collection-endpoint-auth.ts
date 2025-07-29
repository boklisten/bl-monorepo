import { HttpContext } from "@adonisjs/core/http";
import { JwtPayload } from "jsonwebtoken";

import { PermissionService } from "#services/permission_service";
import { BlEndpointRestriction } from "#services/types/bl-collection";
import { BlError } from "#shared/bl-error/bl-error";

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

function authenticate(
  restriction: BlEndpointRestriction | undefined,
  ctx: HttpContext,
): Promise<JwtPayload | undefined> {
  return new Promise((resolve, reject) => {
    if (restriction) {
      try {
        const accessToken = PermissionService.authenticateLegacy(ctx);
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
