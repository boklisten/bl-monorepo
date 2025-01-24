import LocalLoginHandler from "@backend/lib/auth/local/local-login.handler.js";
import UserHandler from "@backend/lib/auth/user/user.handler.js";
import EmailValidationHelper from "@backend/lib/collections/email-validation/helpers/email-validation.helper.js";
import { SEDbQuery } from "@backend/lib/query/se.db-query.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
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
};
test.group("UserHandler", (group) => {
    let testProvider = "";
    let testProviderId = "";
    let testUsername = "";
    let emailValidationLinkSuccess = true;
    let sandbox;
    let userStorageGetByQueryStub;
    let emailValidationHelperSendLinkStub;
    group.each.setup(() => {
        testProvider = testUser.login.provider;
        testProviderId = testUser.login.providerId;
        testUsername = testUser.username;
        emailValidationLinkSuccess = true;
        sandbox = createSandbox();
        sandbox.stub(BlStorage.UserDetails, "add").callsFake(() => {
            return new Promise((resolve) => {
                resolve({
                    id: testUser.userDetail,
                    user: { id: testUser.blid },
                });
            });
        });
        sandbox.stub(BlStorage.Users, "add").resolves(testUser);
        sandbox.stub(LocalLoginHandler, "get").resolves({});
        userStorageGetByQueryStub = sandbox
            .stub(BlStorage.Users, "getByQuery")
            .callsFake((query) => {
            return new Promise((resolve, reject) => {
                // @ts-expect-error fixme: auto ignored
                if (query.stringFilters[0].value !== testUser.username) {
                    return reject(new BlError("not found").code(702));
                }
                resolve([{ username: testUser.username }]);
            });
        });
        emailValidationHelperSendLinkStub = sandbox
            .stub(EmailValidationHelper, "createAndSendEmailValidationLink")
            .callsFake(() => {
            if (!emailValidationLinkSuccess) {
                return Promise.reject(new BlError("could not create and send email validation"));
            }
            return Promise.resolve();
        });
    });
    group.each.teardown(() => {
        sandbox.restore();
    });
    test("get() - should reject with BlError when provider is empty", async () => {
        const provider = "";
        UserHandler.get(provider, testProviderId).should.rejectedWith(BlError);
    });
    test("get() - should reject with BlError when provider is null", async () => {
        const provider = null;
        UserHandler
            // @ts-expect-error fixme: auto ignored
            .get(provider, testProviderId)
            .should.rejectedWith(BlError);
    });
    test("get() - should reject with BlError when providerId is null", async () => {
        const providerId = null;
        UserHandler
            // @ts-expect-error fixme: auto ignored
            .get(testProvider, providerId)
            .should.rejectedWith(BlError);
    });
    test("get() - should reject with BlError when providerId is empty", async () => {
        const providerId = "";
        UserHandler.get(testProvider, providerId).should.rejectedWith(BlError);
    });
    test("getByUsername() - when username is undefined should reject with BlError", async () => {
        const username = undefined;
        UserHandler
            // @ts-expect-error fixme: auto ignored
            .getByUsername(username)
            .should.be.rejectedWith(BlError);
    });
    test("getByUsername() - when username is not found should reject with BlError code 702 not found", async () => {
        const username = "thisis@notfound.com";
        UserHandler.getByUsername(username).catch((error) => {
            error.getCode().should.be.eq(702);
        });
    });
    test("should resolve with a User object", async () => {
        UserHandler.getByUsername(testUser.username).then((user) => {
            user.username.should.be.eq(testUser.username);
        });
    });
    test("should select the first one with primary if primary is set", async () => {
        const username = "jimmy@dore.com";
        // @ts-expect-error fixme: auto ignored
        const testUsers = [
            { username: username, movedToPrimary: "someObjectId" },
            { username: username, primary: true },
        ];
        const dbQuery = new SEDbQuery();
        dbQuery.stringFilters = [{ fieldName: "username", value: username }];
        userStorageGetByQueryStub.withArgs(dbQuery).resolves(testUsers);
        return expect(UserHandler.getByUsername(username)).to.eventually.be.eql({
            username: username,
            primary: true,
        });
    });
    test("username is undefined", async () => {
        const username = undefined;
        UserHandler
            // @ts-expect-error fixme: auto ignored
            .create(username, testProvider, testProviderId)
            .should.be.rejectedWith(BlError);
    });
    test("create() - provider is empty", async () => {
        const provider = "";
        UserHandler.create(testUsername, provider, testProviderId).should.be.rejectedWith(BlError);
    });
    test("create() - providerId is null", async () => {
        const providerId = "";
        UserHandler.create(testUsername, testProvider, providerId).should.be.rejectedWith(BlError);
    });
    test("should resolve with a user when username, provider and providerId is valid", async () => {
        UserHandler.create("jesus@christ.com", testProvider, testProviderId).then((user) => {
            user.username.should.be.eql(testUser.username);
            user.login.should.be.eql(testUser.login);
        });
    });
    test('should reject if username already exists and provider is "local"', async () => {
        testUsername = "James@bond.com";
        const dbQuery = new SEDbQuery();
        dbQuery.stringFilters = [{ fieldName: "username", value: testUsername }];
        userStorageGetByQueryStub.withArgs(dbQuery).resolves([testUser]);
        UserHandler.create(testUsername, "local", "someProviderId").catch((blError) => {
            expect(blError.getMsg()).to.be.eq(`username "${testUsername}" already exists, but trying to create new user with provider "local"`);
            return expect(blError.getCode()).to.be.eq(903);
        });
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
        return expect(UserHandler.create(testUsername, "facebook", "someFacebookId")).to.be.fulfilled;
    });
    test("should reject if emailValidationHelper rejects on sending of email validation link", async () => {
        emailValidationLinkSuccess = false;
        UserHandler.create("jhon@boi.com", testProvider, testProviderId).catch((blError) => {
            return expect(blError.errorStack.length).to.be.gte(1);
            // @ts-expect-error fixme: auto ignored
            return expect(blError.errorStack[0].getMsg()).to.be.eq("could not send out email validation link");
            return expect(blError.getCode()).to.eq(903);
        });
    });
    test("should send out email validation link on user creation", async () => {
        emailValidationLinkSuccess = true;
        testUsername = "johnny@ronny.com";
        UserHandler.create(testUsername, testProvider, testProviderId).then(() => {
            return expect(emailValidationHelperSendLinkStub).to.have.been.calledWith(testUser.userDetail);
        });
    });
    test(".exists() should reject with BlError when provider is undefined", async () => {
        const provider = undefined;
        UserHandler
            // @ts-expect-error fixme: auto ignored
            .exists(provider, testProviderId)
            .should.be.rejectedWith(BlError);
    });
    test(".exists() should reject with BlError when ", async () => {
        const providerId = "";
        UserHandler.exists(testProvider, providerId).should.be.rejectedWith(BlError);
    });
});
