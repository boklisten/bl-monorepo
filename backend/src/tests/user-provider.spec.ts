import "mocha";
import LocalLoginHandler from "@backend/auth/local/local-login.handler.js";
import TokenHandler from "@backend/auth/token/token.handler.js";
import { UserProvider } from "@backend/auth/user/user-provider.js";
import UserHandler from "@backend/auth/user/user.handler.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("UserProvider", () => {
  let sandbox: sinon.SinonSandbox;
  let userGetStub: sinon.SinonStub;
  let userCreateStub: sinon.SinonStub;
  let userValidStub: sinon.SinonStub;
  let createTokenStub: sinon.SinonStub;
  let createDefaultLocalLoginStub: sinon.SinonStub;
  const userProvider = new UserProvider();

  beforeEach(() => {
    sandbox = createSandbox();
    userGetStub = sandbox.stub(UserHandler, "get");
    userCreateStub = sandbox.stub(UserHandler, "create");
    userValidStub = sandbox.stub(UserHandler, "valid");
    createTokenStub = sandbox.stub(TokenHandler, "createTokens");
    createDefaultLocalLoginStub = sandbox.stub(
      LocalLoginHandler,
      "createDefaultLocalLoginIfNoneIsFound",
    );
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("loginOrCreate()", () => {
    it("should reject if userHandler.valid rejects", () => {
      userGetStub.resolves({ id: "user1" });
      userValidStub.rejects(new BlError("user is not valid"));

      return expect(
        userProvider.loginOrCreate("username@mail.com", "local", "abcdef"),
      ).to.eventually.be.rejectedWith(BlError, /user is not valid/);
    });

    it("should reject if LocalLoginHandler.createDefaultLocalLoginIfNoneIsFound rejects", () => {
      userGetStub.resolves({ id: "user1" });
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
        userCreateStub.resolves(user);
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
        userGetStub.resolves(user);
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
