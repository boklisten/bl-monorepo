import "mocha";

import { LocalLoginHandler } from "@backend/auth/local/local-login.handler";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { localLoginSchema } from "@backend/collections/local-login/local-login.schema";
import { SEDbQuery } from "@backend/query/se.db-query";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

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
  const localLoginStorage = new BlDocumentStorage<LocalLogin>(
    BlCollectionName.LocalLogins,
    localLoginSchema,
  );
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

  const localLoginHandler = new LocalLoginHandler(localLoginStorage);

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
  });

  sinon.stub(localLoginStorage, "getByQuery").callsFake((query: SEDbQuery) => {
    return new Promise((resolve, reject) => {
      // @ts-expect-error fixme: auto ignored
      if (query.stringFilters[0].value === testUsername) {
        resolve([dummyLocalLogin]);
      }
      reject(new BlError("not found").code(702));
    });
  });

  sinon
    .stub(localLoginStorage, "add")
    .callsFake((localLogin: any, user: any) => {
      return new Promise((resolve, reject) => {
        resolve(testLocalLogin);
      });
    });

  sinon
    .stub(localLoginStorage, "update")
    .callsFake((id: string, data: any, user: any) => {
      if (updateSuccess) {
        return Promise.resolve(testLocalLogin);
      }

      return Promise.reject(new BlError("could not update"));
    });

  describe("#create", () => {
    describe("should reject with TypeError when", () => {
      it("username is empty or undefined", () => {
        testLocalLogin.username = "";
        return localLoginHandler
          .add(testLocalLogin)
          .should.be.rejectedWith(BlError);
      });

      it("provider is empty or undefiend", () => {
        testLocalLogin.provider = "";
        return localLoginHandler
          .add(testLocalLogin)
          .should.be.rejectedWith(BlError);
      });

      it("providerId is empty or undefined", () => {
        testLocalLogin.providerId = "";
        return localLoginHandler
          .add(testLocalLogin)
          .should.be.rejectedWith(BlError);
      });

      it("hashedPassword is empty or undefined", () => {
        testLocalLogin.hashedPassword = "";
        return localLoginHandler
          .add(testLocalLogin)
          .should.be.rejectedWith(BlError);
      });

      it("salt is empty or undefined", () => {
        testLocalLogin.salt = "";
        return localLoginHandler
          .add(testLocalLogin)
          .should.be.rejectedWith(BlError);
      });
    });

    describe("should reject with TypeError when", () => {
      it('username is "alb@"', () => {
        testLocalLogin.username = "alb@";
        return localLoginHandler
          .add(testLocalLogin)
          .should.be.rejectedWith(BlError);
      });

      it('username is "bill@mail."', () => {
        testLocalLogin.username = "bill@mail.";
        return localLoginHandler
          .add(testLocalLogin)
          .should.be.rejectedWith(BlError);
      });

      it('username is "alli @mail.com"', () => {
        testLocalLogin.username = "alli @mail.com";
        return localLoginHandler
          .add(testLocalLogin)
          .should.be.rejectedWith(BlError);
      });
    });

    it("should resolve when LocalLogin is valid", () => {
      return localLoginHandler
        .add(testLocalLogin)
        .should.eventually.eq(testLocalLogin);
    });
  });

  describe("#get", () => {
    describe("should reject with TypeError when", () => {
      it("username is not a valid Email", () => {
        testUsername = "al";
        return localLoginHandler
          .get(testUsername)
          .should.be.rejectedWith(BlError);
      });

      it("username is not empty", () => {
        testUsername = "";
        return localLoginHandler
          .get(testUsername)
          .should.be.rejectedWith(BlError);
      });

      it("username is null", () => {
        // @ts-expect-error fixme: auto ignored
        testUsername = null;
        return localLoginHandler
          .get(testUsername)
          .should.be.rejectedWith(BlError);
      });
    });

    it("should reject with blError.code 702 when username is not found in db", (done) => {
      localLoginHandler.get("notFound@mail.com").catch((blError: BlError) => {
        expect(blError.getCode()).to.eql(702);
        done();
      });
    });

    it("should resolve with LocalLogin object when username is found", () => {
      return localLoginHandler
        .get(testUsername)
        .should.eventually.eq(dummyLocalLogin);
    });
  });

  describe("#setPassword", () => {
    it("should reject if localLogin is not found", () => {
      const testUsername = "notFound@mail.com";

      return expect(
        localLoginHandler.setPassword(testUsername, "password"),
      ).to.be.rejectedWith(
        BlError,
        /localLogin was not found with username "notFound@mail.com/,
      );
    });

    it("should reject if password is less than 6 characters", () => {
      const testPassword = "short";

      return expect(
        localLoginHandler.setPassword(testUsername, testPassword),
      ).to.be.rejectedWith(BlError, /localLogin password to short/);
    });

    it("should reject if localLogin is not found by username", () => {
      const notFoundUsername = "notFound@mail.com";

      return expect(
        localLoginHandler.setPassword(notFoundUsername, "password"),
      ).to.be.rejectedWith(
        BlError,
        /localLogin was not found with username "notFound@mail.com"/,
      );
    });

    it("should reject if localLogin.update rejects", () => {
      updateSuccess = false;

      return expect(
        localLoginHandler.setPassword(testUsername, "password"),
      ).to.be.rejectedWith(BlError, /localLogin could not be updated/);
    });

    it("should resolve if valid username and password is set", () => {
      return expect(localLoginHandler.setPassword(testUsername, "password123"))
        .to.be.fulfilled;
    });
  });
});
