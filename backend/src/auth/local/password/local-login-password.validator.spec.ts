import "mocha";
import { LocalLoginPasswordValidator } from "@backend/auth/local/password/local-login-password.validator.js";
import BlCrypto from "@backend/crypto/bl-crypto.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("LocalLoginPasswordValidator", () => {
  const localLoginPasswordValidator = new LocalLoginPasswordValidator();

  let sandbox: sinon.SinonSandbox;
  let testPassword = "";
  let testSalt = "";
  let testHashedPassword = "";
  beforeEach(() => {
    sandbox = createSandbox();
    sandbox
      .stub(BlCrypto, "hash")
      .callsFake((password: string, salt: string) => {
        return Promise.resolve(password + salt);
      });
    testPassword = "dog";
    testSalt = "salt";
    testHashedPassword = testPassword + testSalt;
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("validate", () => {
    describe("should reject with BlError when", () => {
      it("password is empty", () => {
        testPassword = "";

        return localLoginPasswordValidator
          .validate(testPassword, testSalt, testHashedPassword)
          .should.be.rejectedWith(BlError);
      });

      it("salt is empty", () => {
        testSalt = "";
        return localLoginPasswordValidator
          .validate(testPassword, testSalt, testHashedPassword)
          .should.be.rejectedWith(BlError);
      });

      it("hashedPassword is empty", () => {
        testHashedPassword = "";
        return localLoginPasswordValidator
          .validate(testPassword, testSalt, testHashedPassword)
          .should.be.rejectedWith(BlError);
      });
    });

    it("should reject with Error when password is not correct", () => {
      testPassword = "human";
      return localLoginPasswordValidator
        .validate(testPassword, testSalt, testHashedPassword)
        .should.be.rejectedWith(BlError);
    });

    it("should resolve with true when password is correct", () => {
      return localLoginPasswordValidator.validate(
        testPassword,
        testSalt,
        testHashedPassword,
      ).should.eventually.be.true;
    });
  });
});
