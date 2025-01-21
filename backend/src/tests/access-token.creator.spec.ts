import AccessTokenCreator from "@backend/auth/token/access-token/access-token.creator.js";
import RefreshTokenCreator from "@backend/auth/token/refresh/refresh-token.creator.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { UserPermission } from "@shared/permission/user-permission.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("AccessTokenCreator", () => {
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
      RefreshTokenCreator.create(testUsername, testUserid).then(
        (refreshToken: string) => {
          testRefreshToken = refreshToken;
          done();
        },
        () => {
          testRefreshToken = "this is not valid..";
          done();
        },
      );
    });

    context("when parameter is malformed", () => {
      it("should reject with BlError when username is undefined", () => {
        const username = undefined;
        return AccessTokenCreator.create(
          // @ts-expect-error fixme: auto ignored
          username,
          testUserid,
          testPermission,
          testUserDetailId,
          testRefreshToken,
        ).should.be.rejectedWith(BlError);
      });

      it("should reject with BlError when username is empty", () => {
        const username = "";
        return AccessTokenCreator.create(
          username,
          testUserid,
          testPermission,
          testUserDetailId,
          testRefreshToken,
        ).should.be.rejectedWith(BlError);
      });

      it("should reject with BlError when userId is undefined", () => {
        const userid = undefined;
        return AccessTokenCreator.create(
          testUsername,
          // @ts-expect-error fixme: auto ignored
          userid,
          testPermission,
          testUserDetailId,
          testRefreshToken,
        ).should.be.rejectedWith(BlError);
      });

      it("should should reject with BlError when requestToken is undefined", () => {
        const refreshToken = "";
        return AccessTokenCreator.create(
          testUsername,
          testUserid,
          testPermission,
          testUserDetailId,
          refreshToken,
        ).should.be.rejectedWith(BlError);
      });
    });

    context("when refreshToken is not valid", () => {
      it("should reject with BlError code 905", (done) => {
        const refreshToken = "this is not valid";
        AccessTokenCreator.create(
          testUsername,
          testUserid,
          testPermission,
          testUserDetailId,
          refreshToken,
        ).then(
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
        AccessTokenCreator.create(
          testUsername,
          testUserid,
          testPermission,
          testUserDetailId,
          testRefreshToken,
        ).then(
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
