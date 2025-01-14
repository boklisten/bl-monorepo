import "mocha";
import { TokenHandler } from "@backend/auth/token/token.handler";
import { UserHandler } from "@backend/auth/user/user.handler";
import { BlError } from "@shared/bl-error/bl-error";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

const testUser: any = {
  id: "abc",
  username: "bill@clintonisugly.com",
  userDetail: "abc",
  permission: "customer",
  login: {
    provider: "",
    providerId: "",
  },
  blid: "123",
  valid: true,
};

describe("TokenHandler", () => {
  const userHandler = new UserHandler();
  const tokenHandler = new TokenHandler(userHandler);

  sinon.stub(userHandler, "getByUsername").callsFake((username: string) => {
    return new Promise((resolve, reject) => {
      if (username === testUser.username) {
        return resolve(testUser);
      }
      reject(new BlError("could not find user"));
    });
  });

  sinon.stub(userHandler, "valid").callsFake(() => {
    return Promise.resolve();
  });

  describe("createTokens()", () => {
    context("when username is not valid", () => {
      it("should reject with BlError", () => {
        const username = undefined;
        return (
          tokenHandler

            // @ts-expect-error fixme: auto ignored
            .createTokens(username)
            .should.be.rejectedWith(BlError)
        );
      });
    });

    context("when username is valid", () => {
      it("should resolve with accessToken and refreshToken", (done) => {
        tokenHandler
          .createTokens(testUser.username)
          .then((tokens: { accessToken: string; refreshToken: string }) => {
            tokens.accessToken.should.have.length.gte(50);
            tokens.refreshToken.should.have.length.gte(50);
            done();
          });
      });
    });
  });
});
