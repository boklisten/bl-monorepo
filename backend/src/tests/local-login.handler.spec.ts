import LocalLoginHandler from "@backend/express/auth/local/local-login.handler.js";
import { SEDbQuery } from "@backend/express/query/se.db-query.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { LocalLogin } from "@backend/types/local-login.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, should, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

const dummyLocalLogin = {
  username: "albert@protonmail.com",
  provider: "local",
  providerId: "123",
  hashedPassword: "abc",
  salt: "car",
  id: "random",
};

test.group("LocalLoginHandler", (group) => {
  let testLocalLogin: LocalLogin = {
    id: "1",
    username: "a",
    providerId: "1",
    hashedPassword: "b",
    provider: "c",
    salt: "h",
  };
  let testUsername = "";
  let updateSuccess: boolean;

  let sandbox: sinon.SinonSandbox;
  group.each.setup(() => {
    testUsername = "albert@protonmail.com";
    testLocalLogin = {
      id: "abc",
      username: "albert@gmail.com",
      provider: "local",
      providerId: "i",
      hashedPassword: "abc",
      salt: "l",
    };
    updateSuccess = true;
    sandbox = createSandbox();
    sandbox
      .stub(BlStorage.LocalLogins, "getByQuery")
      .callsFake((query: SEDbQuery) => {
        return new Promise((resolve, reject) => {
          // @ts-expect-error fixme: auto ignored
          if (query.stringFilters[0].value === testUsername) {
            resolve([dummyLocalLogin]);
          }
          reject(new BlError("not found").code(702));
        });
      });

    sandbox.stub(BlStorage.LocalLogins, "add").callsFake(() => {
      return new Promise((resolve) => {
        resolve(testLocalLogin);
      });
    });

    sandbox.stub(BlStorage.LocalLogins, "update").callsFake(() => {
      if (updateSuccess) {
        return Promise.resolve(testLocalLogin);
      }

      return Promise.reject(new BlError("could not update"));
    });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("username is empty or undefined", async () => {
    testLocalLogin.username = "";
    LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(BlError);
  });

  test("provider is empty or undefiend", async () => {
    testLocalLogin.provider = "";
    LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(BlError);
  });

  test("providerId is empty or undefined", async () => {
    testLocalLogin.providerId = "";
    LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(BlError);
  });

  test("hashedPassword is empty or undefined", async () => {
    testLocalLogin.hashedPassword = "";
    LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(BlError);
  });

  test("salt is empty or undefined", async () => {
    testLocalLogin.salt = "";
    LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(BlError);
  });

  test('username is "alb@"', async () => {
    testLocalLogin.username = "alb@";
    LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(BlError);
  });

  test('username is "bill@mail."', async () => {
    testLocalLogin.username = "bill@mail.";
    LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(BlError);
  });

  test('username is "alli @mail.com"', async () => {
    testLocalLogin.username = "alli @mail.com";
    LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(BlError);
  });

  test("should resolve when LocalLogin is valid", async () => {
    LocalLoginHandler.add(testLocalLogin).should.eventually.eq(testLocalLogin);
  });

  test("username is not a valid Email", async () => {
    testUsername = "al";
    LocalLoginHandler.get(testUsername).should.be.rejectedWith(BlError);
  });

  test("username is not empty", async () => {
    testUsername = "";
    LocalLoginHandler.get(testUsername).should.be.rejectedWith(BlError);
  });

  test("username is null", async () => {
    // @ts-expect-error fixme: auto ignored
    testUsername = null;
    LocalLoginHandler.get(testUsername).should.be.rejectedWith(BlError);
  });

  test("should reject with blError.code 702 when username is not found in db", async () => {
    LocalLoginHandler.get("notFound@mail.com").catch((blError: BlError) => {
      return expect(blError.getCode()).to.eql(702);
    });
  });

  test("should resolve with LocalLogin object when username is found", async () => {
    LocalLoginHandler.get(testUsername).should.eventually.eq(dummyLocalLogin);
  });

  test("should reject if localLogin is not found", async () => {
    const testUsername = "notFound@mail.com";

    return expect(
      LocalLoginHandler.setPassword(testUsername, "password"),
    ).to.be.rejectedWith(
      BlError,
      /localLogin was not found with username "notFound@mail.com/,
    );
  });

  test("should reject if password is less than 6 characters", async () => {
    const testPassword = "short";

    return expect(
      LocalLoginHandler.setPassword(testUsername, testPassword),
    ).to.be.rejectedWith(BlError, /localLogin password to short/);
  });

  test("should reject if localLogin is not found by username", async () => {
    const notFoundUsername = "notFound@mail.com";

    return expect(
      LocalLoginHandler.setPassword(notFoundUsername, "password"),
    ).to.be.rejectedWith(
      BlError,
      /localLogin was not found with username "notFound@mail.com"/,
    );
  });

  test("should reject if localLogin.update rejects", async () => {
    // fixme wrong test
    return expect(LocalLoginHandler.setPassword(testUsername, "password")).to.be
      .fulfilled;
  });

  test("should resolve if valid username and password is set", async () => {
    return expect(LocalLoginHandler.setPassword(testUsername, "password123")).to
      .be.fulfilled;
  });
});
