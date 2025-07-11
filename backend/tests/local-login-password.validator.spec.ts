import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import LocalLoginPasswordValidator from "#services/auth/local/local-login-password.validator";
import BlCrypto from "#services/config/bl-crypto";
import { BlError } from "#shared/bl-error/bl-error";

chaiUse(chaiAsPromised);
should();

test.group("LocalLoginPasswordValidator", (group) => {
  let sandbox: sinon.SinonSandbox;
  const testPassword = "dog";
  const testSalt = "salt";
  const testHashedPassword = testPassword + testSalt;
  group.each.setup(() => {
    sandbox = createSandbox();
    sandbox
      .stub(BlCrypto, "hash")
      .callsFake((password: string, salt: string) => {
        return Promise.resolve(password + salt);
      });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("password is empty", async () => {
    LocalLoginPasswordValidator.validate(
      "",
      testSalt,
      testHashedPassword,
      // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });

  test("salt is empty", async () => {
    LocalLoginPasswordValidator.validate(
      testPassword,
      "",
      testHashedPassword,
      // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });

  test("hashedPassword is empty", async () => {
    LocalLoginPasswordValidator.validate(
      testPassword,
      testSalt,
      "",
      // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });

  test("should reject with Error when password is not correct", async () => {
    LocalLoginPasswordValidator.validate(
      "human",
      testSalt,
      testHashedPassword,
      // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });

  test("should resolve with true when password is correct", async () => {
    LocalLoginPasswordValidator.validate(
      testPassword,
      testSalt,
      testHashedPassword,
      // @ts-expect-error fixme: auto ignored bad test types
    ).should.eventually.be.true;
  });
});
