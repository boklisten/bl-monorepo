import "mocha";

import { LocalLoginHandler } from "@backend/auth/local/local-login.handler";
import { UserHandler } from "@backend/auth/user/user.handler";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { EmailValidationHelper } from "@backend/collections/email-validation/helpers/email-validation.helper";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { User } from "@backend/collections/user/user";
import { UserSchema } from "@backend/collections/user/user.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { SEDbQuery } from "@backend/query/se.db-query";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

const testUser = {
  id: "user1",
  userDetail: "userDetail1",
  permission: "customer",
  login: {
    provider: "local",
    providerId: "123",
  },
  blid: "",
  username: "bill@gmail.com",
  valid: false,
} as User;

describe("UserHandler", () => {
  const userStorage = new BlDocumentStorage<User>(
    BlCollectionName.Users,
    UserSchema,
  );
  const emailValidationHelper: EmailValidationHelper =
    new EmailValidationHelper();
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
    userDetailSchema,
  );
  const localLoginHandler: LocalLoginHandler = new LocalLoginHandler();
  const userHandler = new UserHandler(
    userDetailStorage,
    userStorage,
    emailValidationHelper,
    localLoginHandler,
  );
  let testProvider = "";
  let testProviderId = "";
  let testUsername = "";
  let emailValidationLinkSuccess = true;

  beforeEach(() => {
    testProvider = testUser.login.provider;
    testProviderId = testUser.login.providerId;
    testUsername = testUser.username;
    emailValidationLinkSuccess = true;
  });

  const emailValidationHelperSendLinkStub = sinon
    .stub(emailValidationHelper, "createAndSendEmailValidationLink")
    .callsFake(() => {
      if (!emailValidationLinkSuccess) {
        return Promise.reject(
          new BlError("could not create and send email validation"),
        );
      }

      return Promise.resolve();
    });

  sinon.stub(userDetailStorage, "add").callsFake(() => {
    return new Promise((resolve) => {
      resolve({ id: testUser.userDetail, user: { id: testUser.blid } } as any);
    });
  });

  sinon.stub(userStorage, "add").resolves(testUser);

  sinon.stub(localLoginHandler, "get").resolves({} as LocalLogin);

  const userStorageGetByQueryStub = sinon
    .stub(userStorage, "getByQuery")
    .callsFake((query: SEDbQuery) => {
      return new Promise((resolve, reject) => {
        // @ts-expect-error fixme: auto ignored
        if (query.stringFilters[0].value !== testUser.username) {
          return reject(new BlError("not found").code(702));
        }

        resolve([{ username: testUser.username } as User]);
      });
    });

  describe("get()", () => {
    describe("should reject with BlError when", () => {
      it("provider is empty", () => {
        const provider = "";
        return userHandler
          .get(provider, testProviderId)
          .should.rejectedWith(BlError);
      });

      it("provider is null", () => {
        const provider = null;
        return (
          userHandler

            // @ts-expect-error fixme: auto ignored
            .get(provider, testProviderId)
            .should.rejectedWith(BlError)
        );
      });

      it("providerId is null", () => {
        const providerId = null;
        return (
          userHandler

            // @ts-expect-error fixme: auto ignored
            .get(testProvider, providerId)
            .should.rejectedWith(BlError)
        );
      });

      it("providerId is empty", () => {
        const providerId = "";
        return userHandler
          .get(testProvider, providerId)
          .should.rejectedWith(BlError);
      });
    });
  });

  describe("getByUsername()", () => {
    context("when username is undefined", () => {
      it("should reject with BlError", () => {
        const username = undefined;
        return (
          userHandler

            // @ts-expect-error fixme: auto ignored
            .getByUsername(username)
            .should.be.rejectedWith(BlError)
        );
      });
    });

    context("when username is not found", () => {
      it("should reject with BlError code 702 not found", (done) => {
        const username = "thisis@notfound.com";

        userHandler.getByUsername(username).catch((error: BlError) => {
          error.getCode().should.be.eq(702);
          done();
        });
      });
    });

    context("when username is found", () => {
      it("should resolve with a User object", (done) => {
        userHandler.getByUsername(testUser.username).then((user: User) => {
          user.username.should.be.eq(testUser.username);
          done();
        });
      });
    });

    context("when multiple users is found with same username", () => {
      it("should select the first one with primary if primary is set", () => {
        const username = "jimmy@dore.com";

        // @ts-expect-error fixme: auto ignored
        const testUsers = [
          { username: username, movedToPrimary: "someObjectId" },
          { username: username, primary: true },
        ] as User[];

        const dbQuery = new SEDbQuery();
        dbQuery.stringFilters = [{ fieldName: "username", value: username }];

        userStorageGetByQueryStub.withArgs(dbQuery).resolves(testUsers);

        return expect(userHandler.getByUsername(username)).to.eventually.be.eql(
          { username: username, primary: true },
        );
      });
    });
  });

  describe("create()", () => {
    describe("should reject whith BlError when", () => {
      it("username is undefined", () => {
        const username = undefined;
        return (
          userHandler

            // @ts-expect-error fixme: auto ignored
            .create(username, testProvider, testProviderId)
            .should.be.rejectedWith(BlError)
        );
      });

      it("provider is empty", () => {
        const provider = "";
        return userHandler
          .create(testUsername, provider, testProviderId)
          .should.be.rejectedWith(BlError);
      });

      it("providerId is null", () => {
        const providerId = "";
        return userHandler
          .create(testUsername, testProvider, providerId)
          .should.be.rejectedWith(BlError);
      });
    });

    it("should resolve with a user when username, provider and providerId is valid", () => {
      return userHandler
        .create("jesus@christ.com", testProvider, testProviderId)
        .then((user: User) => {
          user.username.should.be.eql(testUser.username);
          user.login.should.be.eql(testUser.login);
        });
    });

    it('should reject if username already exists and provider is "local"', (done) => {
      testUsername = "James@bond.com";
      const dbQuery = new SEDbQuery();
      dbQuery.stringFilters = [{ fieldName: "username", value: testUsername }];

      userStorageGetByQueryStub.withArgs(dbQuery).resolves([testUser]);

      userHandler
        .create(testUsername, "local", "someProviderId")
        .catch((blError: BlError) => {
          expect(blError.getMsg()).to.be.eq(
            `username "${testUsername}" already exists, but trying to create new user with provider "local"`,
          );

          expect(blError.getCode()).to.be.eq(903);
          done();
        });
    });

    it('should resolve if username already exists and provider is "google"', () => {
      testUsername = "gert@bert.com";
      const dbQuery = new SEDbQuery();
      dbQuery.stringFilters = [{ fieldName: "username", value: testUsername }];

      userStorageGetByQueryStub.withArgs(dbQuery).resolves([testUser]);

      return expect(userHandler.create(testUsername, "google", "someGoogleId"))
        .to.be.fulfilled;
    });

    it('should resolve if username already exists and provider is "facebook"', () => {
      testUsername = "jets@bets.com";
      const dbQuery = new SEDbQuery();
      dbQuery.stringFilters = [{ fieldName: "username", value: testUsername }];

      userStorageGetByQueryStub.withArgs(dbQuery).resolves([testUser]);

      return expect(
        userHandler.create(testUsername, "facebook", "someFacebookId"),
      ).to.be.fulfilled;
    });

    it("should reject if emailValidationHelper rejects on sending of email validation link", (done) => {
      emailValidationLinkSuccess = false;

      userHandler
        .create("jhon@boi.com", testProvider, testProviderId)
        .catch((blError: BlError) => {
          expect(blError.errorStack.length).to.be.gte(1);

          // @ts-expect-error fixme: auto ignored
          expect(blError.errorStack[0].getMsg()).to.be.eq(
            "could not send out email validation link",
          );

          expect(blError.getCode()).to.eq(903);

          done();
        });
    });

    it("should send out email validation link on user creation", (done) => {
      emailValidationLinkSuccess = true;
      testUsername = "johnny@ronny.com";

      userHandler
        .create(testUsername, testProvider, testProviderId)
        .then(() => {
          expect(emailValidationHelperSendLinkStub).to.have.been.calledWith(
            testUser.userDetail,
          );

          done();
        });
    });
  });

  describe("exists()", () => {
    describe("should reject with BlError when", () => {
      it("provider is undefined", () => {
        const provider = undefined;
        return (
          userHandler

            // @ts-expect-error fixme: auto ignored
            .exists(provider, testProviderId)
            .should.be.rejectedWith(BlError)
        );
      });

      it("providerId is empty", () => {
        const providerId = "";
        return userHandler
          .exists(testProvider, providerId)
          .should.be.rejectedWith(BlError);
      });
    });
  });
});
