import "mocha";
import { BlError, UserPermission } from "@boklisten/bl-model";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { AccessToken } from "@/auth/token/access-token/access-token";
import { AccessTokenCreator } from "@/auth/token/access-token/access-token.creator";
import { RefreshToken } from "@/auth/token/refresh/refresh-token";
import { RefreshTokenCreator } from "@/auth/token/refresh/refresh-token.creator";
import { TokenConfig } from "@/auth/token/token.config";

chai.use(chaiAsPromised);

describe("AccessTokenCreator", () => {
  const refreshTokenConfig: RefreshToken = {
    iss: "",
    aud: "",
    expiresIn: "12h",
    iat: 0,
    sub: "",
    username: "",
  };

  const accessTokenConfig: AccessToken = {
    iss: "",
    aud: "",
    expiresIn: "30s",
    iat: 0,
    sub: "",
    username: "",
    permission: "customer",
    details: "",
  };

  const tokenConfig = new TokenConfig(accessTokenConfig, refreshTokenConfig);
  const accessTokenCreator = new AccessTokenCreator(tokenConfig);
  const refreshTokenCreator = new RefreshTokenCreator(tokenConfig);

  describe("createAccessToken()", () => {
    let testUsername = "";
    let testUserid = "";
    let testPermission: UserPermission = "customer";
    let testRefreshToken = "";
    let testUserDetailId = "";

    beforeEach((done) => {
      testUsername = "bill@clintonlol.com";
      testUserid = "124";
      testPermission = "customer";
      testUserDetailId = "avx";
      refreshTokenCreator.create(testUsername, testUserid).then(
        (refreshToken: string) => {
          testRefreshToken = refreshToken;
          done();
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (error: BlError) => {
          testRefreshToken = "this is not valid..";
          done();
        },
      );
    });

    context("when parameter is malformed", () => {
      it("should reject with BlError when username is undefined", () => {
        const username = undefined;
        return accessTokenCreator
          .create(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            username,
            testUserid,
            testPermission,
            testUserDetailId,
            testRefreshToken,
          )
          .should.be.rejectedWith(BlError);
      });

      it("should reject with BlError when username is empty", () => {
        const username = "";
        return accessTokenCreator
          .create(
            username,
            testUserid,
            testPermission,
            testUserDetailId,
            testRefreshToken,
          )
          .should.be.rejectedWith(BlError);
      });

      it("should reject with BlError when userId is undefined", () => {
        const userid = undefined;
        return accessTokenCreator
          .create(
            testUsername,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            userid,
            testPermission,
            testUserDetailId,
            testRefreshToken,
          )
          .should.be.rejectedWith(BlError);
      });

      it("should should reject with BlError when requestToken is undefined", () => {
        const refreshToken = "";
        return accessTokenCreator
          .create(
            testUsername,
            testUserid,
            testPermission,
            testUserDetailId,
            refreshToken,
          )
          .should.be.rejectedWith(BlError);
      });
    });

    context("when refreshToken is not valid", () => {
      it("should reject with BlError code 905", (done) => {
        const refreshToken = "this is not valid";
        accessTokenCreator
          .create(
            testUsername,
            testUserid,
            testPermission,
            testUserDetailId,
            refreshToken,
          )
          .then(
            (accessToken: string) => {
              accessToken.should.not.be.fulfilled;
              done();
            },
            (error: BlError) => {
              error.getCode().should.be.eq(905);
              done();
            },
          );
      });
    });

    context("when all parameters is valid", () => {
      it("should resolve with a accessToken", (done) => {
        accessTokenCreator
          .create(
            testUsername,
            testUserid,
            testPermission,
            testUserDetailId,
            testRefreshToken,
          )
          .then(
            (accessToken: string) => {
              accessToken.should.be.a("string");
              done();
            },
            (error: BlError) => {
              error.should.not.be.fulfilled;
              done();
            },
          );
      });
    });
  });
});
