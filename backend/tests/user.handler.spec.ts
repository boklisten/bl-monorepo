import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import UserHandler from "#services/auth/user/user.handler";
import EmailValidationHelper from "#services/collections/email-validation/helpers/email-validation.helper";
import { BlStorage } from "#services/storage/bl-storage";
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
  const testProvider = "local";
  let testProviderId = "";
  let testUsername = "";
  let emailValidationLinkSuccess = true;
  let sandbox: sinon.SinonSandbox;
  let emailValidationHelperSendLinkStub: sinon.SinonStub;

  group.each.setup(() => {
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

  test("should resolve with a user when username, provider and providerId is valid", async () => {
    UserHandler.create("jesus@christ.com", testProvider, testProviderId).then(
      (user: User) => {
        // @ts-expect-error fixme: auto ignored bad test types
        user.username.should.be.eql(testUser.username);
      },
    );
  });

  test("should send out email validation link on user creation", async () => {
    emailValidationLinkSuccess = true;
    testUsername = "johnny@ronny.com";

    UserHandler.create(testUsername, testProvider, testProviderId).then(() => {
      return expect(emailValidationHelperSendLinkStub).to.have.been.called;
    });
  });
});
