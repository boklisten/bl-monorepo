import "mocha";
import { BlError, UserPermission } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { sign } from "jsonwebtoken";

import { AccessToken } from "@/auth/token/access-token/access-token";
import { AccessTokenCreator } from "@/auth/token/access-token/access-token.creator";
import { AccessTokenValidator } from "@/auth/token/access-token/access-token.validator";
import { RefreshToken } from "@/auth/token/refresh/refresh-token";
import { RefreshTokenCreator } from "@/auth/token/refresh/refresh-token.creator";
import { TokenConfig } from "@/auth/token/token.config";

chai.use(chaiAsPromised);

describe("", () => {
  const refreshTokenConfig: RefreshToken = {
    iss: "boklisten.co",
    aud: "boklisten.co",
    expiresIn: "12h",
    iat: 0,
    sub: "",
    username: "",
  };

  const accessTokenConfig: AccessToken = {
    iss: "boklisten.co",
    aud: "boklisten.co",
    expiresIn: "30s",
    iat: 0,
    sub: "",
    username: "",
    permission: "customer",
    details: "",
  };

  const tokenConfig = new TokenConfig(accessTokenConfig, refreshTokenConfig);
  const accessTokenValidator = new AccessTokenValidator();
  const refreshTokenCreator = new RefreshTokenCreator(tokenConfig);
  const accessTokenCreator = new AccessTokenCreator(tokenConfig);

  describe("validate()", () => {
    context("when accessToken is empty or undefined", () => {
      it("should reject with BlError", () => {
        return accessTokenValidator
          .validate("")
          .should.be.rejectedWith(BlError);
      });
    });

    context("when accessToken is not valid", () => {
      it("should reject with BlError code 910", (done) => {
        accessTokenValidator
          .validate("this is not valid")
          .catch((error: BlError) => {
            error.getCode().should.be.eq(910);
            done();
          });
      });
    });

    context("when accessToken is expired", () => {
      it("should reject with BlError code 910", (done) => {
        const username = "bill@butt.com";

        sign(
          {
            username: username,
            iat: Math.floor(Date.now() / 1000) - 10000,
          },
          "test",
          { expiresIn: "1s" },
          (error, accessToken) => {
            accessTokenValidator
              .validate(accessToken)
              .catch((error: BlError) => {
                error.getCode().should.be.eq(910);
                done();
              });
          },
        );
      });
    });

    context("when accessToken is valid", () => {
      it("should resolve with a payload", (done) => {
        const username = "bill@anderson.com";
        const userid = "123";
        const permission: UserPermission = "admin";
        const userDetailId = "abc";
        refreshTokenCreator
          .create(username, userid)
          .then((refreshToken: string) => {
            accessTokenCreator
              .create(username, userid, permission, userDetailId, refreshToken)
              .then((accessToken: string) => {
                accessTokenValidator
                  .validate(accessToken)
                  .then((payload: AccessToken) => {
                    expect(payload.username).to.eq(username);
                    expect(payload.aud).to.eq(accessTokenConfig.aud);
                    done();
                  });
              });
          });
      });
    });
  });
});
