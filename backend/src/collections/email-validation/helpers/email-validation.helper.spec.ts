import "mocha";
import { BlError, UserDetail } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { BlCollectionName } from "@/collections/bl-collection";
import { EmailValidation } from "@/collections/email-validation/email-validation";
import { EmailValidationHelper } from "@/collections/email-validation/helpers/email-validation.helper";
import { Messenger } from "@/messenger/messenger";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

chai.use(chaiAsPromised);

describe("EmailValidationHelper", () => {
  const messenger = new Messenger();
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const emailValidationStorage = new BlDocumentStorage<EmailValidation>(
    BlCollectionName.EmailValidations,
  );
  const emailValidationHelper = new EmailValidationHelper(
    messenger,
    userDetailStorage,
    emailValidationStorage,
  );

  const testUserDetail = { id: "", email: "" } as UserDetail;
  let emailValidationStorageAddSuccess: boolean;
  let testEmailValidation: EmailValidation;

  beforeEach(() => {
    testUserDetail.id = "userDetail1";
    testUserDetail.email = "user@detail.com";
    emailValidationStorageAddSuccess = true;
    testEmailValidation = {
      id: "emailValidation1",
      userDetail: testUserDetail.id,
      email: testUserDetail.email,
    };
  });

  sinon.stub(userDetailStorage, "get").callsFake((id: string) => {
    if (id !== testUserDetail.id) {
      return Promise.reject(new BlError("not found"));
    }

    return Promise.resolve(testUserDetail);
  });

  sinon.stub(emailValidationStorage, "add").callsFake(() => {
    if (!emailValidationStorageAddSuccess) {
      return Promise.reject(new BlError("could not add"));
    }
    return Promise.resolve(testEmailValidation);
  });

  const messengerEmailConfirmationStub = sinon
    .stub(messenger, "emailConfirmation")
    .resolves();

  describe("#createAndSendEmailValidationLink", () => {
    it("should reject if userId is not found", () => {
      return expect(
        emailValidationHelper.createAndSendEmailValidationLink(
          "notFoundUserDetail",
        ),
      ).to.be.rejectedWith(
        BlError,
        /userDetail "notFoundUserDetail" not found/,
      );
    });

    it("should reject if emailValidationStorage.add rejects", () => {
      emailValidationStorageAddSuccess = false;

      return expect(
        emailValidationHelper.createAndSendEmailValidationLink(
          testUserDetail.id,
        ),
      ).to.be.rejectedWith(BlError, /could not add emailValidation/);
    });

    it("should send message to user on emailValidation creation", (done) => {
      emailValidationStorageAddSuccess = true;

      emailValidationHelper
        .createAndSendEmailValidationLink(testUserDetail.id)
        .then(() => {
          expect(messengerEmailConfirmationStub).to.have.been.calledWith(
            testUserDetail,
            testEmailValidation.id,
          );
          done();
        });
    });
  });

  describe("#sendEmailValidationLink", () => {
    it("should reject if userDetail is not found", () => {
      testEmailValidation.userDetail = "notFound";

      return expect(
        emailValidationHelper.sendEmailValidationLink(testEmailValidation),
      ).to.be.rejectedWith(BlError, /userDetail "notFound" not found/);
    });

    it("should call messenger.emailConfirmation", (done) => {
      emailValidationHelper
        .sendEmailValidationLink(testEmailValidation)
        .then(() => {
          expect(messengerEmailConfirmationStub).to.have.been.calledWith(
            testUserDetail,
            testEmailValidation.id,
          );
          done();
        });
    });
  });
});
