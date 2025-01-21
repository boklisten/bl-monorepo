import { PermissionService } from "@backend/auth/permission.service.js";
import { isNotNullish } from "@backend/helper/typescript-helpers.js";
import { BlEndpointRestriction } from "@backend/types/bl-collection.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { AccessToken } from "@shared/token/access-token.js";
import { NextFunction, Request, Response } from "express";
import passport from "passport";

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
  request: Request,
  res: Response,
  next: NextFunction,
): Promise<AccessToken | boolean> {
  return new Promise((resolve, reject) => {
    if (restriction || isNotNullish(request.headers["authorization"])) {
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
      )(request, res, next);
    } else {
      // no authentication needed
      return resolve(true);
    }
  });
}

const CollectionEndpointAuth = {
  authenticate,
};
export default CollectionEndpointAuth;
