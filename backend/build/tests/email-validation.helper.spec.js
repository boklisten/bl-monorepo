import EmailValidationHelper from "@backend/lib/collections/email-validation/helpers/email-validation.helper.js";
import Messenger from "@backend/lib/messenger/messenger.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();
test.group("EmailValidationHelper", (group) => {
    const testUserDetail = { id: "", email: "" };
    let emailValidationStorageAddSuccess;
    let testEmailValidation;
    let messengerEmailConfirmationStub;
    let sandbox;
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
    test("should reject if userId is not found", async () => {
        return expect(EmailValidationHelper.createAndSendEmailValidationLink("notFoundUserDetail")).to.be.rejectedWith(BlError, /userDetail "notFoundUserDetail" not found/);
    });
    test("should reject if emailValidationStorage.add rejects", async () => {
        emailValidationStorageAddSuccess = false;
        return expect(EmailValidationHelper.createAndSendEmailValidationLink(testUserDetail.id)).to.be.rejectedWith(BlError, /could not add emailValidation/);
    });
    test("should send message to user on emailValidation creation", async () => {
        emailValidationStorageAddSuccess = true;
        EmailValidationHelper.createAndSendEmailValidationLink(testUserDetail.id).then(() => {
            return expect(messengerEmailConfirmationStub).to.have.been.calledWith(testUserDetail, testEmailValidation.id);
        });
    });
    test("should reject if userDetail is not found", async () => {
        testEmailValidation.userDetail = "notFound";
        return expect(EmailValidationHelper.sendEmailValidationLink(testEmailValidation)).to.be.rejectedWith(BlError, /userDetail "notFound" not found/);
    });
    test("should call messenger.emailConfirmation", async () => {
        EmailValidationHelper.sendEmailValidationLink(testEmailValidation).then(() => {
            return expect(messengerEmailConfirmationStub).to.have.been.calledWith(testUserDetail, testEmailValidation.id);
        });
    });
});
