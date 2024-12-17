import "mocha";
import { BlError } from "@boklisten/bl-model";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { LocalLoginCreator } from "@/auth/local/local-login-creator/local-login-creator";
import { LocalLoginHandler } from "@/auth/local/local-login.handler";
import { LocalLoginValidator } from "@/auth/local/local-login.validator";
import { HashedPasswordGenerator } from "@/auth/local/password/hashed-password-generator";
import { LocalLoginPasswordValidator } from "@/auth/local/password/local-login-password.validator";
import { ProviderIdGenerator } from "@/auth/local/provider-id/provider-id-generator";
import { SaltGenerator } from "@/auth/local/salt/salt-generator";
import { UserHandler } from "@/auth/user/user.handler";
import { LocalLogin } from "@/collections/local-login/local-login";
import { User } from "@/collections/user/user";
import { SeCrypto } from "@/crypto/se.crypto";

chai.use(chaiAsPromised);

const testLocalLogin = {
  username: "albert@protonmail.com",
  provider: "local",
  providerId: "123",
  hashedPassword: "a",
  salt: "dog",
  id: "12354",
};

describe("LocalLoginValidator", () => {
  const localLoginPasswordValidator = new LocalLoginPasswordValidator(
    new SeCrypto(),
  );
  const saltGenerator = new SaltGenerator();
  const seCrypto = new SeCrypto();
  const hashedPasswordGenerator = new HashedPasswordGenerator(
    saltGenerator,
    seCrypto,
  );
  const providerIdGenerator = new ProviderIdGenerator(seCrypto);
  const localLoginCreator = new LocalLoginCreator(
    hashedPasswordGenerator,
    providerIdGenerator,
  );
  const localLoginHandler = new LocalLoginHandler();
  const userHandler = new UserHandler();
  const localLoginValidator = new LocalLoginValidator(
    localLoginHandler,
    localLoginPasswordValidator,
    localLoginCreator,
    userHandler,
  );

  sinon.stub(localLoginHandler, "get").callsFake((username: string) => {
    return new Promise((resolve, reject) => {
      if (username === testLocalLogin.username) resolve(testLocalLogin);
      reject(new BlError("").code(702));
    });
  });

  sinon.stub(localLoginHandler, "add").callsFake((localLogin: LocalLogin) => {
    return new Promise((resolve) => {
      resolve(localLogin);
    });
  });

  sinon.stub(localLoginPasswordValidator, "validate").resolves(true);

  sinon
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
        active: true,
        lastRequest: "",
      } as User);
    });

  sinon.stub(userHandler, "valid").callsFake(() => {
    return Promise.resolve();
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
          (value: any) => {
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
          (error: any) => {
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
        (value: any) => {
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
