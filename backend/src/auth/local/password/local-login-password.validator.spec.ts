import "mocha";
import { LocalLoginPasswordValidator } from "@backend/auth/local/password/local-login-password.validator";
import { SeCrypto } from "@backend/crypto/se.crypto";
import { BlError } from "@shared/bl-error/bl-error";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("LocalLoginPasswordValidator", () => {
  const seCrypto = new SeCrypto();
  const localLoginPasswordValidator = new LocalLoginPasswordValidator(seCrypto);

  sinon.stub(seCrypto, "hash").callsFake((password: string, salt: string) => {
    return Promise.resolve(password + salt);
  });

  describe("validate", () => {
    let testPassword = "";
    let testSalt = "";
    let testHashedPassword = "";

    beforeEach(() => {
      testPassword = "dog";
      testSalt = "salt";
      testHashedPassword = testPassword + testSalt;
    });

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
