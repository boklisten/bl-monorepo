import "mocha";
import { EmailValidation } from "@backend/collections/email-validation/email-validation.js";
import { EmailValidationHelper } from "@backend/collections/email-validation/helpers/email-validation.helper.js";
import { EmailValidationPostHook } from "@backend/collections/email-validation/hooks/email-validation-post.hook.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("EmailValidationPostHook", () => {
  const emailValidationHelper = new EmailValidationHelper();
  const emailValidationPostHook = new EmailValidationPostHook(
    emailValidationHelper,
  );

  let emailValidationHelperSuccess: boolean;

  let testEmailValidation: EmailValidation;

  beforeEach(() => {
    testEmailValidation = {
      id: "emailValidation1",
      userDetail: "userDetail1",
      email: "email@blapi.co",
    };
  });

  sinon.stub(emailValidationHelper, "sendEmailValidationLink").callsFake(() => {
    if (!emailValidationHelperSuccess) {
      return Promise.reject(
        new BlError("could not send email validation link"),
      );
    }

    return Promise.resolve();
  });

  describe("#after", () => {
    it("should reject if emailValidationHelper.sendEmailValidationLink rejects", (done) => {
      emailValidationHelperSuccess = false;

      emailValidationPostHook
        .after([testEmailValidation])
        .catch((blErr: BlError) => {
          // @ts-expect-error fixme: auto ignored
          expect(blErr.errorStack[0].getMsg()).to.be.eql(
            "could not send email validation link",
          );
          done();
        });
    });
  });
});
