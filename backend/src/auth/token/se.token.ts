import { BlError } from "@shared/bl-error/bl-error";
import { UserPermission } from "@shared/permission/user-permission";
import { sign, verify } from "jsonwebtoken";

export interface JwtPayload {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  permission: UserPermission;
  blid: string;
  username: string;
}

export interface ValidCustomJwtPayload {
  permissions?: string[];
  blid?: string;
  username?: string;
}

export interface JwtOptions {
  exp: number;
  aud: string;
  iss: string;
}

export class SEToken {
  private options: JwtOptions;

  constructor(options?: JwtPayload) {
    if (options) {
      this.options = options;
    } else {
      this.options = {
        exp: 57_600, //16 hours
        aud: "boklisten.co",
        iss: "boklisten.co",
      };
    }
  }

  public createToken(
    username: string,
    permission: UserPermission,
    blid: string,
  ): Promise<string> {
    const blError = new BlError("")
      .className("SeToken")
      .methodName("createToken");
    if (username.length <= 0)
      return Promise.reject(
        blError.msg('username "' + username + '" is to short'),
      );
    if (permission.length <= 0)
      return Promise.reject(blError.msg("permission is undefined"));
    if (blid.length <= 0)
      return Promise.reject(blError.msg('blid "' + blid + '" is to short'));

    return new Promise((resolve, reject) => {
      sign(
        this.createJwtPayload(username, permission, blid),
        this.getSecret(),
        (error, token) => {
          if (error || token === undefined) {
            return reject(
              blError
                .msg("error creating jw token")
                .store("signError", error)
                .code(906),
            );
          }
          resolve(token);
        },
      );
    });
  }

  public validateToken(
    token: string,
    validLoginOptions: { permissions: string[] },
  ): Promise<JwtPayload> {
    const blError = new BlError("")
      .className("SeToken")
      .methodName("validateToken");
    if (token.length <= 0) return Promise.reject(blError.msg("token is empty"));

    return new Promise((resolve, reject) => {
      verify(token, this.getSecret(), (error, decoded) => {
        if (error) {
          return reject(
            blError
              .msg("error verifying token")
              .store("jwtError", error)
              .code(905),
          );
        }

        // @ts-expect-error fixme: auto ignored
        this.validatePayload(decoded, validLoginOptions).then(
          (jwtPayload: JwtPayload) => {
            resolve(jwtPayload);
          },
          (validatePayloadError: BlError) => {
            reject(
              blError
                .msg("could not validate payload")
                .store("decodedPayload", decoded)
                .add(validatePayloadError)
                .code(905),
            );
          },
        );
      });
    });
  }

  public validatePayload(
    jwtPayload: JwtPayload,
    validLoginOptions: {
      permissions: string[];
      restrictedToUserOrAbove?: boolean;
    },
  ): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      if (
        validLoginOptions &&
        !validLoginOptions.restrictedToUserOrAbove &&
        validLoginOptions.permissions &&
        !this.validatePermissions(
          jwtPayload.permission,
          validLoginOptions.permissions,
        )
      ) {
        return reject(
          new BlError(
            'lacking the given permissions, "' +
              jwtPayload.permission.toString() +
              '" does not include all the permissions of "' +
              validLoginOptions.permissions.toString() +
              '"',
          )
            .className("SeToken")
            .methodName("validateToken")
            .code(905),
        );
      }

      resolve(jwtPayload);
    });
  }

  public getSecret(): string {
    return "this is the key";
  }

  public getOptions(): JwtOptions {
    return this.options;
  }

  private validatePermissions(
    decodedPermission: UserPermission,
    validPermissions: string[],
  ): boolean {
    return validPermissions.includes(decodedPermission);
  }

  private createJwtPayload(
    username: string,
    permission: UserPermission,
    blid: string,
  ): JwtPayload {
    return {
      iss: this.options.iss,
      aud: this.options.aud,
      iat: Date.now(),
      exp: Date.now() + this.options.exp,
      permission: permission,
      blid: blid,
      username: username,
    };
  }

  public permissionAbove(
    tokenPermission: UserPermission,
    permissions: UserPermission[],
  ) {
    const lowestPermission = permissions[0];

    if (tokenPermission === lowestPermission) return true;

    if (lowestPermission === "customer") {
      if (tokenPermission === "employee") return true;
      if (tokenPermission === "admin") return true;
    }

    if (lowestPermission === "employee" && tokenPermission === "admin")
      return true;

    return false;
  }
}
