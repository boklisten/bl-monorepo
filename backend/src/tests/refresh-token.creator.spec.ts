import "mocha";

import RefreshTokenCreator from "@backend/auth/token/refresh/refresh-token.creator.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("RefreshTokenCreator", () => {
  describe("createRefreshToken()", () => {
    let testUserid = "";

    beforeEach(() => {
      testUserid = "abc1";
    });

    describe("should reject with BlError when", () => {
      it("username is undefined", (done) => {
        const username = undefined;
        RefreshTokenCreator
          // @ts-expect-error fixme: auto ignored
          .create(username, testUserid)
          .catch((blError: BlError) => {
            blError.getCode().should.be.eq(103);
            done();
          });
      });

      it("userid is null", (done) => {
        const userid = null;
        RefreshTokenCreator

          // @ts-expect-error fixme: auto ignored
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
        RefreshTokenCreator.create(username, testUserid)
          .then((refreshToken) => {
            refreshToken.should.be.a("string").and.have.length.gte(50);
            done();
          })
          .catch((err) => {});
      });
    });
  });
});
