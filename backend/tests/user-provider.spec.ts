import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import LocalLoginHandler from "#services/auth/local/local-login.handler";
import TokenHandler from "#services/auth/token/token.handler";
import UserProvider from "#services/auth/user/user-provider";
import UserHandler from "#services/auth/user/user.handler";
import { BlError } from "#shared/bl-error/bl-error";

chaiUse(chaiAsPromised);
should();

test.group("UserProvider", (group) => {
  let sandbox: sinon.SinonSandbox;
  let userExistsStub: sinon.SinonStub;
  let userCreateStub: sinon.SinonStub;
  let userValidStub: sinon.SinonStub;
  let createTokenStub: sinon.SinonStub;
  let createDefaultLocalLoginStub: sinon.SinonStub;

  group.each.setup(() => {
    sandbox = createSandbox();
    userExistsStub = sandbox.stub(UserHandler, "getOrNull");
    userCreateStub = sandbox.stub(UserHandler, "create");
    userValidStub = sandbox.stub(UserHandler, "valid");
    sandbox.stub(UserHandler, "connectProviderToUser");
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
    userExistsStub.returns(true);
    userValidStub.rejects(new BlError("user is not valid"));

    return expect(
      UserProvider.loginOrCreate("username@mail.com", "facebook", "abcdef"),
    ).to.eventually.be.rejectedWith(BlError, /user is not valid/);
  });

  test("loginOrCreate() - should reject if LocalLoginHandler.createDefaultLocalLoginIfNoneIsFound rejects", async () => {
    userExistsStub.returns(true);
    userValidStub.resolves();
    createDefaultLocalLoginStub.rejects(
      new BlError("local login could not be created"),
    );

    return expect(
      UserProvider.loginOrCreate("username@mail.com", "facebook", "abcde"),
    ).to.eventually.be.rejectedWith(
      BlError,
      /local login could not be created/,
    );
  });

  test("loginOrCreate() - should reject if userHandler.create rejects", async () => {
    userExistsStub.returns(false);
    userCreateStub.rejects(new BlError("user could not be created"));

    return expect(
      UserProvider.loginOrCreate("username@mail.com", "facebook", "abcde"),
    ).to.eventually.be.rejectedWith(BlError, /user could not be created/);
  });

  test("loginOrCreate() - should resolve with a user object and tokens", async () => {
    const user = {};
    userExistsStub.returns(false);
    userCreateStub.resolves(user);
    userValidStub.resolves();
    createDefaultLocalLoginStub.resolves(true);
    const tokens = { accessToken: "atoken", refreshToken: "rtoken" };
    createTokenStub.resolves(tokens);

    return expect(
      UserProvider.loginOrCreate("username@mail.com", "facebook", "abcdefg"),
    ).to.eventually.be.eql(tokens);
  });

  test("loginOrCreate() - should resolve with a user object and tokens", async () => {
    userExistsStub.returns(true);
    userValidStub.resolves();
    createDefaultLocalLoginStub.resolves(true);

    const tokens = { accessToken: "atoken", refreshToken: "rtoken" };
    createTokenStub.resolves(tokens);

    return expect(
      UserProvider.loginOrCreate("username@mail.com", "facebook", "abcdefg"),
    ).to.eventually.be.eql(tokens);
  });
});
