import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import LocalLoginHandler from "#services/auth/local/local-login.handler";
import UserHandler from "#services/auth/user/user.handler";
import EmailValidationHelper from "#services/collections/email-validation/helpers/email-validation.helper";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { LocalLogin } from "#services/types/local-login";
import { User } from "#services/types/user";
import { BlError } from "#shared/bl-error/bl-error";
import { UserDetail } from "#shared/user/user-detail/user-detail";

chaiUse(chaiAsPromised);
should();

const testUser = {
  id: "user1",
  userDetail: "userDetail1",
  permission: "customer",
  blid: "",
  username: "bill@gmail.com",
} as User;

test.group("UserHandler", (group) => {
  let testProvider = "";
  let testProviderId = "";
  let testUsername = "";
  let emailValidationLinkSuccess = true;
  let sandbox: sinon.SinonSandbox;
  let userStorageGetByQueryStub: sinon.SinonStub;
  let emailValidationHelperSendLinkStub: sinon.SinonStub;

  group.each.setup(() => {
    testProvider = "local";
    testProviderId = "123";
    testUsername = testUser.username;
    emailValidationLinkSuccess = true;
    sandbox = createSandbox();

    sandbox.stub(BlStorage.UserDetails, "add").callsFake(() => {
      return new Promise((resolve) => {
        resolve({
          id: testUser.userDetail,
          user: { id: testUser.blid },
        } as UserDetail);
      });
    });

    sandbox.stub(BlStorage.Users, "add").resolves(testUser);

    sandbox.stub(LocalLoginHandler, "get").resolves({} as LocalLogin);

    userStorageGetByQueryStub = sandbox
      .stub(BlStorage.Users, "getByQuery")
      .callsFake((query: SEDbQuery) => {
        return new Promise((resolve, reject) => {
          // @ts-expect-error fixme: auto ignored
          if (query.stringFilters[0].value !== testUser.username) {
            return reject(new BlError("not found").code(702));
          }

          resolve([{ username: testUser.username } as User]);
        });
      });
    emailValidationHelperSendLinkStub = sandbox
      .stub(EmailValidationHelper, "createAndSendEmailValidationLink")
      .callsFake(() => {
        if (!emailValidationLinkSuccess) {
          return Promise.reject(
            new BlError("could not create and send email validation"),
          );
        }

        return Promise.resolve();
      });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("getByUsername() - when username is undefined should reject with BlError", async () => {
    const username = undefined;
    UserHandler

      // @ts-expect-error fixme: auto ignored
      .getByUsername(username)
      // @ts-expect-error fixme: auto ignored bad test types
      .should.be.rejectedWith(BlError);
  });

  test("getByUsername() - when username is not found should reject with BlError code 702 not found", async () => {
    const username = "thisis@notfound.com";

    UserHandler.getByUsername(username).catch((error: BlError) => {
      // @ts-expect-error fixme: auto ignored bad test types
      error.getCode().should.be.eq(702);
    });
  });

  test("should resolve with a User object", async () => {
    UserHandler.getByUsername(testUser.username).then((user: User) => {
      // @ts-expect-error fixme: auto ignored bad test types
      user.username.should.be.eq(testUser.username);
    });
  });

  test("username is undefined", async () => {
    const username = undefined;
    UserHandler

      // @ts-expect-error fixme: auto ignored
      .create(username, testProvider, testProviderId)
      // @ts-expect-error fixme: auto ignored bad test types
      .should.be.rejectedWith(BlError);
  });

  test("create() - provider is empty", async () => {
    const provider = "";
    UserHandler.create(
      testUsername,
      provider,
      testProviderId,
      // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });

  test("create() - providerId is null", async () => {
    const providerId = "";
    UserHandler.create(
      testUsername,
      testProvider,
      providerId,
      // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });

  test("should resolve with a user when username, provider and providerId is valid", async () => {
    UserHandler.create("jesus@christ.com", testProvider, testProviderId).then(
      (user: User) => {
        // @ts-expect-error fixme: auto ignored bad test types
        user.username.should.be.eql(testUser.username);
      },
    );
  });

  test('should reject if username already exists and provider is "local"', async ({
    assert,
  }) => {
    testUsername = "James@bond.com";
    const dbQuery = new SEDbQuery();
    dbQuery.stringFilters = [{ fieldName: "username", value: testUsername }];

    userStorageGetByQueryStub.withArgs(dbQuery).resolves([testUser]);

    UserHandler.create(testUsername, "local", "someProviderId").catch(
      (blError: BlError) => {
        expect(blError.getMsg()).to.be.eq(
          `username "${testUsername}" already exists, but trying to create new user with provider "local"`,
        );

        return assert.equal(blError.getCode(), 903);
      },
    );
  });

  test('should resolve if username already exists and provider is "google"', async () => {
    testUsername = "gert@bert.com";
    const dbQuery = new SEDbQuery();
    dbQuery.stringFilters = [{ fieldName: "username", value: testUsername }];

    userStorageGetByQueryStub.withArgs(dbQuery).resolves([testUser]);

    return expect(UserHandler.create(testUsername, "google", "someGoogleId")).to
      .be.fulfilled;
  });

  test('should resolve if username already exists and provider is "facebook"', async () => {
    testUsername = "jets@bets.com";
    const dbQuery = new SEDbQuery();
    dbQuery.stringFilters = [{ fieldName: "username", value: testUsername }];

    userStorageGetByQueryStub.withArgs(dbQuery).resolves([testUser]);

    return expect(
      UserHandler.create(testUsername, "facebook", "someFacebookId"),
    ).to.be.fulfilled;
  });

  test("should reject if emailValidationHelper rejects on sending of email validation link", async () => {
    emailValidationLinkSuccess = false;

    UserHandler.create("jhon@boi.com", testProvider, testProviderId).catch(
      (blError: BlError) => {
        return expect(blError.errorStack.length).to.be.gte(1);

        // @ts-expect-error fixme: auto ignored
        return expect(blError.errorStack[0].getMsg()).to.be.eq(
          "could not send out email validation link",
        );

        return expect(blError.getCode()).to.eq(903);
      },
    );
  });

  test("should send out email validation link on user creation", async () => {
    emailValidationLinkSuccess = true;
    testUsername = "johnny@ronny.com";

    UserHandler.create(testUsername, testProvider, testProviderId).then(() => {
      return expect(emailValidationHelperSendLinkStub).to.have.been.calledWith(
        testUser.userDetail,
      );
    });
  });
});
