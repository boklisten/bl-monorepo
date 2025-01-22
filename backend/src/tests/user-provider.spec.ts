import LocalLoginHandler from "@backend/auth/local/local-login.handler.js";
import TokenHandler from "@backend/auth/token/token.handler.js";
import UserProvider from "@backend/auth/user/user-provider.js";
import UserHandler from "@backend/auth/user/user.handler.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("UserProvider", (group) => {
  let sandbox: sinon.SinonSandbox;
  let userGetStub: sinon.SinonStub;
  let userCreateStub: sinon.SinonStub;
  let userValidStub: sinon.SinonStub;
  let createTokenStub: sinon.SinonStub;
  let createDefaultLocalLoginStub: sinon.SinonStub;

  group.each.setup(() => {
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
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("loginOrCreate() - should reject if userHandler.valid rejects", async () => {
    userGetStub.resolves({ id: "user1" });
    userValidStub.rejects(new BlError("user is not valid"));

    return expect(
      UserProvider.loginOrCreate("username@mail.com", "local", "abcdef"),
    ).to.eventually.be.rejectedWith(BlError, /user is not valid/);
  });

  test("loginOrCreate() - should reject if LocalLoginHandler.createDefaultLocalLoginIfNoneIsFound rejects", async () => {
    userGetStub.resolves({ id: "user1" });
    userValidStub.resolves();
    createDefaultLocalLoginStub.rejects(
      new BlError("local login could not be created"),
    );

    return expect(
      UserProvider.loginOrCreate("username@mail.com", "local", "abcde"),
    ).to.eventually.be.rejectedWith(
      BlError,
      /local login could not be created/,
    );
  });

  test("loginOrCreate() - should reject if userHandler.create rejects", async () => {
    userGetStub.rejects(new BlError("user not found"));
    userCreateStub.rejects(new BlError("user could not be created"));

    return expect(
      UserProvider.loginOrCreate("username@mail.com", "local", "abcde"),
    ).to.eventually.be.rejectedWith(BlError, /user could not be created/);
  });

  test("loginOrCreate() - should resolve with a user object and tokens", async () => {
    const user = {};
    userGetStub.rejects(new BlError("user not found"));
    userCreateStub.resolves(user);
    userValidStub.resolves();
    createDefaultLocalLoginStub.resolves(true);
    const tokens = { accessToken: "atoken", refreshToken: "rtoken" };
    createTokenStub.resolves(tokens);

    return expect(
      UserProvider.loginOrCreate("username@mail.com", "local", "abcdefg"),
    ).to.eventually.be.eql({ user: user, tokens: tokens });
  });

  test("loginOrCreate() - should resolve with a user object and tokens", async () => {
    const user = { id: "user1", username: "user@mail.com" };
    userGetStub.resolves(user);
    userValidStub.resolves();
    createDefaultLocalLoginStub.resolves(true);

    const tokens = { accessToken: "atoken", refreshToken: "rtoken" };
    createTokenStub.resolves(tokens);

    return expect(
      UserProvider.loginOrCreate("username@mail.com", "local", "abcdefg"),
    ).to.eventually.be.eql({ user: user, tokens: tokens });
  });
});
