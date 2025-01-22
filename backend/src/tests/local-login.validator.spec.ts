import LocalLoginPasswordValidator from "@backend/auth/local/local-login-password.validator.js";
import LocalLoginHandler from "@backend/auth/local/local-login.handler.js";
import LocalLoginValidator from "@backend/auth/local/local-login.validator.js";
import UserHandler from "@backend/auth/user/user.handler.js";
import { LocalLogin } from "@backend/types/local-login.js";
import { User } from "@backend/types/user.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

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

    sandbox
      .stub(UserHandler, "create")
      .callsFake((username: string, provider: string, providerId: string) => {
        return Promise.resolve({
          id: "",
          userDetail: "",
          permission: "customer",
          login: {
            provider: provider,
            providerId: providerId,
          },
          blid: "",
          username: username,
          valid: true,
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
    ).should.be.rejectedWith(BlError);
  });

  test("password is empty", async () => {
    testPassword = "";
    LocalLoginValidator.validate(
      testUserName,
      testPassword,
    ).should.be.rejectedWith(BlError);
  });

  test("username does not exist", async () => {
    testUserName = "billy@user.com";
    testPassword = "thePassword";
    LocalLoginValidator.validate(testUserName, testPassword).then(
      (value) => {
        value.should.not.be.fulfilled;
      },
      (error: BlError) => {
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
    }).should.eventually.be.true;
  });

  test("should reject with BlError if username does exist", async () => {
    const username = testLocalLogin.username;
    const password = "something";

    LocalLoginValidator.create(username, password).then(
      (value) => {
        value.should.not.be.fulfilled;
      },
      (error: BlError) => {
        error.getMsg().should.contain("already exists");
      },
    );
  });

  test("should resolve with provider and providerId if username and password is valid", async () => {
    const username = "amail@address.com";
    const password = "thisIsAValidPassword";

    const providerAndProviderId = await LocalLoginValidator.create(
      username,
      password,
    );
    providerAndProviderId.should.have.property("provider").and.eq("local");
    providerAndProviderId.should.have
      .property("providerId")
      .and.have.length.gte(64);
  });
});
