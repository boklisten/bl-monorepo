import "mocha";
import { BlError } from "@boklisten/bl-model";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { AccessToken } from "@/auth/token/access-token/access-token";
import { RefreshToken } from "@/auth/token/refresh/refresh-token";
import { RefreshTokenCreator } from "@/auth/token/refresh/refresh-token.creator";
import { TokenConfig } from "@/auth/token/token.config";

chai.use(chaiAsPromised);

describe("RefreshTokenCreator", () => {
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

  const refreshTokenCreator = new RefreshTokenCreator(tokenConfig);

  describe("createRefreshToken()", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let testUsername = "";
    let testUserid = "";

    beforeEach(() => {
      testUsername = "bill@oriley.co";
      testUserid = "abc1";
    });

    describe("should reject with BlError when", () => {
      it("username is undefined", (done) => {
        const username = undefined;
        refreshTokenCreator
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .create(username, testUserid)
          .catch((blError: BlError) => {
            blError.getCode().should.be.eq(103);
            done();
          });
      });

      it("userid is null", (done) => {
        const userid = null;
        refreshTokenCreator
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .create(testUserid, userid)
          .catch((blError: BlError) => {
            blError.getCode().should.be.eq(103);
            done();
          });
      });
    });

    describe("should resolve with a RefreshToken when", () => {
      it("username is bill@meathome.se and userid is valid", (done) => {
        const username = "bill@meathome.se";
        refreshTokenCreator
          .create(username, testUserid)
          .then((refreshToken) => {
            refreshToken.should.be.a("string").and.have.length.gte(50);
            done();
          })
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .catch((err) => {});
      });
    });
  });
});
