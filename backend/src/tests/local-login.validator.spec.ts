import "mocha";

import LocalLoginPasswordValidator from "@backend/auth/local/local-login-password.validator.js";
import LocalLoginHandler from "@backend/auth/local/local-login.handler.js";
import { LocalLoginValidator } from "@backend/auth/local/local-login.validator.js";
import { UserHandler } from "@backend/auth/user/user.handler.js";
import { LocalLogin } from "@backend/types/local-login.js";
import { User } from "@backend/types/user.js";
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

describe("LocalLoginValidator", () => {
  const userHandler = new UserHandler();
  const localLoginValidator = new LocalLoginValidator(userHandler);
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
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
      .stub(userHandler, "create")
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

    sandbox.stub(userHandler, "valid").callsFake(() => {
      return Promise.resolve();
    });
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("validate()", () => {
    let testUserName = "";
    let testPassword = "";

    beforeEach(() => {
      testUserName = "albert@protonmail.com";
      testPassword = "hello";
    });

    describe("should reject with BlError when", () => {
      it("username is not an email", () => {
        testUserName = "bill";
        return localLoginValidator
          .validate(testUserName, testPassword)
          .should.be.rejectedWith(BlError);
      });

      it("password is empty", () => {
        testPassword = "";
        return localLoginValidator
          .validate(testUserName, testPassword)
          .should.be.rejectedWith(BlError);
      });
    });

    describe("should reject with BlError when", () => {
      it("username does not exist", () => {
        testUserName = "billy@user.com";
        testPassword = "thePassword";
        return localLoginValidator.validate(testUserName, testPassword).then(
          (value) => {
            value.should.not.be.fulfilled;
          },
          (error: BlError) => {
            error.getCode().should.be.eq(702);
          },
        );
      });
    });

    it("should resolve with correct provider and providerId when username and password is correct", () => {
      const expectedProvider = {
        provider: testLocalLogin.provider,
        providerId: testLocalLogin.providerId,
      };
      return new Promise((resolve, reject) => {
        localLoginValidator.validate(testUserName, testPassword).then(
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
  });

  describe("create()", () => {
    it("should reject with BlError if username does exist", () => {
      const username = testLocalLogin.username;
      const password = "something";

      return localLoginValidator.create(username, password).then(
        (value) => {
          value.should.not.be.fulfilled;
        },
        (error: BlError) => {
          error.getMsg().should.contain("already exists");
        },
      );
    });

    it("should resolve with provider and providerId if username and password is valid", () => {
      const username = "amail@address.com";
      const password = "thisIsAValidPassword";

      return localLoginValidator.create(username, password).then(
        (providerAndProviderId: { provider: string; providerId: string }) => {
          providerAndProviderId.should.have
            .property("provider")
            .and.eq("local");

          providerAndProviderId.should.have
            .property("providerId")
            .and.have.length.gte(64);
        },
        (error: BlError) => {
          error.should.not.be.fulfilled;
        },
      );
    });
  });
});
