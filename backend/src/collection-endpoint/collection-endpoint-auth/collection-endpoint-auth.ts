import { AccessToken, BlError } from "@boklisten/bl-model";
import { NextFunction, Request, Response } from "express";
import passport from "passport";

import { BlEndpointRestriction } from "@/collections/bl-collection";
import { isNotNullish } from "@/helper/typescript-helpers";

export class CollectionEndpointAuth {
  private _authStrategy = "jwt";

  public authenticate(
    restriction: BlEndpointRestriction,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<AccessToken | boolean> {
    return new Promise((resolve, reject) => {
      if (restriction || isNotNullish(req.headers["authorization"])) {
        // it is a restriction on this endpoint and authentication is required, also try if there are sent with a auth header
        passport.authenticate(
          this._authStrategy,
          (_err: unknown, tokens: { accessToken: AccessToken }) => {
            try {
              this.validateAuth(restriction, tokens.accessToken);
              return resolve(tokens.accessToken);
            } catch (e) {
              // if authorization tokens is not valid
              return reject(e);
            }
          },
        )(req, res, next);
      } else {
        // no authentication needed
        return resolve(true);
      }
    });
  }

  private validateAuth(
    restriction: BlEndpointRestriction,
    accessToken: AccessToken,
  ): boolean {
    if (!accessToken) {
      throw new BlError("accessToken invalid").code(910);
    }

    if (restriction && restriction.permissions) {
      if (restriction.permissions.indexOf(accessToken.permission) <= -1) {
        throw new BlError(
          `user "${accessToken.sub}" with permission "${accessToken.permission}" does not have access to this endpoint`,
        ).code(904);
      }
    }

    return true;
  }
}
