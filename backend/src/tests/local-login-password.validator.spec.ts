import LocalLoginPasswordValidator from "@backend/auth/local/local-login-password.validator.js";
import BlCrypto from "@backend/config/bl-crypto.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("LocalLoginPasswordValidator", () => {
  let sandbox: sinon.SinonSandbox;
  const testPassword = "dog";
  const testSalt = "salt";
  const testHashedPassword = testPassword + testSalt;
  beforeEach(() => {
    sandbox = createSandbox();
    sandbox
      .stub(BlCrypto, "hash")
      .callsFake((password: string, salt: string) => {
        return Promise.resolve(password + salt);
      });
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("validate", () => {
    describe("should reject with BlError when", () => {
      it("password is empty", () => {
        return LocalLoginPasswordValidator.validate(
          "",
          testSalt,
          testHashedPassword,
        ).should.be.rejectedWith(BlError);
      });

      it("salt is empty", () => {
        return LocalLoginPasswordValidator.validate(
          testPassword,
          "",
          testHashedPassword,
        ).should.be.rejectedWith(BlError);
      });

      it("hashedPassword is empty", () => {
        return LocalLoginPasswordValidator.validate(
          testPassword,
          testSalt,
          "",
        ).should.be.rejectedWith(BlError);
      });
    });

    it("should reject with Error when password is not correct", () => {
      return LocalLoginPasswordValidator.validate(
        "human",
        testSalt,
        testHashedPassword,
      ).should.be.rejectedWith(BlError);
    });

    it("should resolve with true when password is correct", () => {
      return LocalLoginPasswordValidator.validate(
        testPassword,
        testSalt,
        testHashedPassword,
      ).should.eventually.be.true;
    });
  });
});
