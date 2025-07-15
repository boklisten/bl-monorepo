import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { EmailValidation } from "#services/collections/email-validation/email-validation";
import EmailValidationHelper from "#services/collections/email-validation/helpers/email-validation.helper";
import Messenger from "#services/messenger/messenger";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { UserDetail } from "#shared/user/user-detail/user-detail";

chaiUse(chaiAsPromised);
should();

test.group("EmailValidationHelper", (group) => {
  const testUserDetail = { id: "", email: "" } as UserDetail;
  let emailValidationStorageAddSuccess: boolean;
  let testEmailValidation: EmailValidation;
  let messengerEmailConfirmationStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    testUserDetail.id = "userDetail1";
    testUserDetail.email = "user@detail.com";
    emailValidationStorageAddSuccess = true;
    testEmailValidation = {
      id: "emailValidation1",
      userDetail: testUserDetail.id,
      email: testUserDetail.email,
    };

    sandbox = createSandbox();
    sandbox.stub(BlStorage.UserDetails, "get").callsFake((id) => {
      if (id !== testUserDetail.id) {
        return Promise.reject(new BlError("not found"));
      }

      return Promise.resolve(testUserDetail);
    });

    sandbox.stub(BlStorage.EmailValidations, "add").callsFake(() => {
      if (!emailValidationStorageAddSuccess) {
        return Promise.reject(new BlError("could not add"));
      }
      return Promise.resolve(testEmailValidation);
    });

    messengerEmailConfirmationStub = sandbox
      .stub(Messenger, "emailConfirmation")
      .resolves();
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if emailValidationStorage.add rejects", async () => {
    emailValidationStorageAddSuccess = false;

    return expect(
      EmailValidationHelper.createAndSendEmailValidationLink(
        testUserDetail.email,
        testUserDetail.id,
      ),
    ).to.be.rejectedWith(BlError, /could not add/);
  });

  test("should send message to user on emailValidation creation", async () => {
    emailValidationStorageAddSuccess = true;

    EmailValidationHelper.createAndSendEmailValidationLink(
      testUserDetail.email,
      testUserDetail.id,
    ).then(() => {
      return expect(messengerEmailConfirmationStub).to.have.been.called;
    });
  });

  test("should call messenger.emailConfirmation", async () => {
    EmailValidationHelper.sendEmailValidationLink(testEmailValidation).then(
      () => {
        return expect(messengerEmailConfirmationStub).to.have.been.called;
      },
    );
  });
});
