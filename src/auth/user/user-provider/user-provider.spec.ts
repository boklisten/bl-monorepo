import { BlError } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import "mocha";
import sinon from "sinon";

import { LocalLoginHandler } from "@/auth/local/local-login.handler";
import { TokenHandler } from "@/auth/token/token.handler";
import { UserProvider } from "@/auth/user/user-provider/user-provider";
import { UserHandler } from "@/auth/user/user.handler";

chai.use(chaiAsPromised);

describe("UserProvider", () => {
  const userHandler = new UserHandler();
  const tokenHandler = new TokenHandler(userHandler);
  const userGetStub = sinon.stub(userHandler, "get");
  const userCreateStub = sinon.stub(userHandler, "create");
  const userValidStub = sinon.stub(userHandler, "valid");
  const localLoginHandler = new LocalLoginHandler();
  const createTokenStub = sinon.stub(tokenHandler, "createTokens");

  const createDefaultLocalLoginStub = sinon.stub(
    localLoginHandler,
    "createDefaultLocalLoginIfNoneIsFound",
  );
  const userProvider = new UserProvider(
    userHandler,
    localLoginHandler,
    tokenHandler,
  );

  beforeEach(() => {
    userGetStub.reset();
    userCreateStub.reset();
    userValidStub.reset();
    createDefaultLocalLoginStub.reset();
    createTokenStub.reset();
  });

  describe("loginOrCreate()", () => {
    it("should reject if userHandler.valid rejects", () => {
      userGetStub.resolves({ id: "user1" } as any);
      userValidStub.rejects(new BlError("user is not valid"));

      return expect(
        userProvider.loginOrCreate("username@mail.com", "local", "abcdef"),
      ).to.eventually.be.rejectedWith(BlError, /user is not valid/);
    });

    it("should reject if localLoginHandler.createDefaultLocalLoginIfNoneIsFound rejects", () => {
      userGetStub.resolves({ id: "user1" } as any);
      userValidStub.resolves();
      createDefaultLocalLoginStub.rejects(
        new BlError("local login could not be created"),
      );

      return expect(
        userProvider.loginOrCreate("username@mail.com", "local", "abcde"),
      ).to.eventually.be.rejectedWith(
        BlError,
        /local login could not be created/,
      );
    });

    context("if user does not exist", () => {
      it("should reject if userHandler.create rejects", () => {
        userGetStub.rejects(new BlError("user not found"));
        userCreateStub.rejects(new BlError("user could not be created"));

        return expect(
          userProvider.loginOrCreate("username@mail.com", "local", "abcde"),
        ).to.eventually.be.rejectedWith(BlError, /user could not be created/);
      });

      it("should resolve with a user object and tokens", () => {
        const user = {};
        userGetStub.rejects(new BlError("user not found"));
        userCreateStub.resolves(user as any);
        userValidStub.resolves();
        createDefaultLocalLoginStub.resolves(true);
        const tokens = { accessToken: "atoken", refreshToken: "rtoken" };
        createTokenStub.resolves(tokens);

        return expect(
          userProvider.loginOrCreate("username@mail.com", "local", "abcdefg"),
        ).to.eventually.be.eql({ user: user, tokens: tokens });
      });
    });

    context("if user does exist", () => {
      it("should resolve with a user object and tokens", () => {
        const user = { id: "user1", username: "user@mail.com" };
        userGetStub.resolves(user as any);
        userValidStub.resolves();
        createDefaultLocalLoginStub.resolves(true);

        const tokens = { accessToken: "atoken", refreshToken: "rtoken" };
        createTokenStub.resolves(tokens);

        return expect(
          userProvider.loginOrCreate("username@mail.com", "local", "abcdefg"),
        ).to.eventually.be.eql({ user: user, tokens: tokens });
      });
    });
  });
});
