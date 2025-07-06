import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import LocalLoginPasswordValidator from "#services/auth/local/local-login-password.validator";
import LocalLoginHandler from "#services/auth/local/local-login.handler";
import LocalLoginValidator from "#services/auth/local/local-login.validator";
import UserHandler from "#services/auth/user/user.handler";
import { LocalLogin } from "#services/types/local-login";
import { User } from "#services/types/user";
import { BlError } from "#shared/bl-error/bl-error";

chaiUse(chaiAsPromised);
should();

const testLocalLogin = {
  username: "albert@protonmail.com",
  provider: "local",
  providerId: "123",
  hashedPassword: "a",
  salt: "dog",
  id: "12354",
};

test.group("LocalLoginValidator", (group) => {
  let sandbox: sinon.SinonSandbox;
  group.each.setup(() => {
    sandbox = createSandbox();
    sandbox.stub(LocalLoginHandler, "get").callsFake((username: string) => {
      return new Promise((resolve, reject) => {
        if (username === testLocalLogin.username) resolve(testLocalLogin);
        reject(new BlError("").code(702));
      });
    });

    sandbox
      .stub(LocalLoginHandler, "add")
      .callsFake((localLogin: LocalLogin) => {
        return new Promise((resolve) => {
          resolve(localLogin);
        });
      });

    sandbox.stub(LocalLoginPasswordValidator, "validate").resolves(true);

    sandbox.stub(UserHandler, "create").callsFake((username: string) => {
      return Promise.resolve({
        id: "",
        userDetail: "",
        permission: "customer",
        blid: "",
        username: username,
      } as User);
    });

    sandbox.stub(UserHandler, "valid").callsFake(() => {
      return Promise.resolve();
    });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  let testUserName = "";
  let testPassword = "";

  group.each.setup(() => {
    testUserName = "albert@protonmail.com";
    testPassword = "hello";
  });

  test("username is not an email", async () => {
    testUserName = "bill";
    LocalLoginValidator.validate(
      testUserName,
      testPassword,
      // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });

  test("password is empty", async () => {
    testPassword = "";
    LocalLoginValidator.validate(
      testUserName,
      testPassword,
      // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });

  test("username does not exist", async () => {
    testUserName = "billy@user.com";
    testPassword = "thePassword";
    LocalLoginValidator.validate(testUserName, testPassword).then(
      (value) => {
        // @ts-expect-error fixme: auto ignored bad test types
        value.should.not.be.fulfilled;
      },
      (error: BlError) => {
        // @ts-expect-error fixme: auto ignored bad test types
        error.getCode().should.be.eq(702);
      },
    );
  });

  test("should resolve with correct provider and providerId when username and password is correct", async () => {
    const expectedProvider = {
      provider: testLocalLogin.provider,
      providerId: testLocalLogin.providerId,
    };
    return new Promise((resolve, reject) => {
      LocalLoginValidator.validate(testUserName, testPassword).then(
        (returnedProvider: { provider: string; providerId: string }) => {
          if (returnedProvider.providerId === expectedProvider.providerId)
            resolve(true);
          reject(new Error("provider is not equal to expectedProvider"));
        },
        (error) => {
          reject(error);
        },
      );
      // @ts-expect-error fixme: auto ignored bad test types
    }).should.eventually.be.true;
  });

  test("should reject with BlError if username does exist", async () => {
    const username = testLocalLogin.username;
    const password = "something";

    LocalLoginValidator.create(username, password).then(
      (value) => {
        // @ts-expect-error fixme: auto ignored bad test types
        value.should.not.be.fulfilled;
      },
      (error: BlError) => {
        // @ts-expect-error fixme: auto ignored bad test types
        error.getMsg().should.contain("already exists");
      },
    );
  });
});
