import "mocha";

import LocalLoginHandler from "@backend/auth/local/local-login.handler.js";
import { SEDbQuery } from "@backend/query/se.db-query.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { LocalLogin } from "@backend/types/local-login.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
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

describe("LocalLoginHandler", () => {
  const baseLocalLogin = {
    id: "1",
    username: "a",
    providerId: "1",
    hashedPassword: "b",
    provider: "c",
    salt: "h",
  };
  let testLocalLogin: LocalLogin = baseLocalLogin;
  let testUsername = "";
  let updateSuccess: boolean;

  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
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

    sandbox
      .stub(BlStorage.LocalLogins, "add")
      .callsFake((localLogin: any, user: any) => {
        return new Promise((resolve, reject) => {
          resolve(testLocalLogin);
        });
      });

    sandbox
      .stub(BlStorage.LocalLogins, "update")
      .callsFake((id: string, data: any) => {
        if (updateSuccess) {
          return Promise.resolve(testLocalLogin);
        }

        return Promise.reject(new BlError("could not update"));
      });
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("#create", () => {
    describe("should reject with TypeError when", () => {
      it("username is empty or undefined", () => {
        testLocalLogin.username = "";
        return LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(
          BlError,
        );
      });

      it("provider is empty or undefiend", () => {
        testLocalLogin.provider = "";
        return LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(
          BlError,
        );
      });

      it("providerId is empty or undefined", () => {
        testLocalLogin.providerId = "";
        return LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(
          BlError,
        );
      });

      it("hashedPassword is empty or undefined", () => {
        testLocalLogin.hashedPassword = "";
        return LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(
          BlError,
        );
      });

      it("salt is empty or undefined", () => {
        testLocalLogin.salt = "";
        return LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(
          BlError,
        );
      });
    });

    describe("should reject with TypeError when", () => {
      it('username is "alb@"', () => {
        testLocalLogin.username = "alb@";
        return LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(
          BlError,
        );
      });

      it('username is "bill@mail."', () => {
        testLocalLogin.username = "bill@mail.";
        return LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(
          BlError,
        );
      });

      it('username is "alli @mail.com"', () => {
        testLocalLogin.username = "alli @mail.com";
        return LocalLoginHandler.add(testLocalLogin).should.be.rejectedWith(
          BlError,
        );
      });
    });

    it("should resolve when LocalLogin is valid", () => {
      return LocalLoginHandler.add(testLocalLogin).should.eventually.eq(
        testLocalLogin,
      );
    });
  });

  describe("#get", () => {
    describe("should reject with TypeError when", () => {
      it("username is not a valid Email", () => {
        testUsername = "al";
        return LocalLoginHandler.get(testUsername).should.be.rejectedWith(
          BlError,
        );
      });

      it("username is not empty", () => {
        testUsername = "";
        return LocalLoginHandler.get(testUsername).should.be.rejectedWith(
          BlError,
        );
      });

      it("username is null", () => {
        // @ts-expect-error fixme: auto ignored
        testUsername = null;
        return LocalLoginHandler.get(testUsername).should.be.rejectedWith(
          BlError,
        );
      });
    });

    it("should reject with blError.code 702 when username is not found in db", (done) => {
      LocalLoginHandler.get("notFound@mail.com").catch((blError: BlError) => {
        expect(blError.getCode()).to.eql(702);
        done();
      });
    });

    it("should resolve with LocalLogin object when username is found", () => {
      return LocalLoginHandler.get(testUsername).should.eventually.eq(
        dummyLocalLogin,
      );
    });
  });

  describe("#setPassword", () => {
    it("should reject if localLogin is not found", () => {
      const testUsername = "notFound@mail.com";

      return expect(
        LocalLoginHandler.setPassword(testUsername, "password"),
      ).to.be.rejectedWith(
        BlError,
        /localLogin was not found with username "notFound@mail.com/,
      );
    });

    it("should reject if password is less than 6 characters", () => {
      const testPassword = "short";

      return expect(
        LocalLoginHandler.setPassword(testUsername, testPassword),
      ).to.be.rejectedWith(BlError, /localLogin password to short/);
    });

    it("should reject if localLogin is not found by username", () => {
      const notFoundUsername = "notFound@mail.com";

      return expect(
        LocalLoginHandler.setPassword(notFoundUsername, "password"),
      ).to.be.rejectedWith(
        BlError,
        /localLogin was not found with username "notFound@mail.com"/,
      );
    });

    it("should reject if localLogin.update rejects", () => {
      updateSuccess = false;

      return expect(
        LocalLoginHandler.setPassword(testUsername, "password"),
      ).to.be.rejectedWith(BlError, /localLogin could not be updated/);
    });

    it("should resolve if valid username and password is set", () => {
      return expect(LocalLoginHandler.setPassword(testUsername, "password123"))
        .to.be.fulfilled;
    });
  });
});
