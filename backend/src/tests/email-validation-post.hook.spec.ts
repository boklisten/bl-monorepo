import { EmailValidation } from "@backend/express/collections/email-validation/email-validation.js";
import EmailValidationHelper from "@backend/express/collections/email-validation/helpers/email-validation.helper.js";
import { EmailValidationPostHook } from "@backend/express/collections/email-validation/hooks/email-validation-post.hook.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("EmailValidationPostHook", (group) => {
  const emailValidationPostHook = new EmailValidationPostHook();

  let emailValidationHelperSuccess: boolean;

  let testEmailValidation: EmailValidation;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    testEmailValidation = {
      id: "emailValidation1",
      userDetail: "userDetail1",
      email: "email@blapi.co",
    };
    sandbox = createSandbox();
    sandbox
      .stub(EmailValidationHelper, "sendEmailValidationLink")
      .callsFake(() => {
        if (!emailValidationHelperSuccess) {
          return Promise.reject(
            new BlError("could not send email validation link"),
          );
        }

        return Promise.resolve();
      });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if emailValidationHelper.sendEmailValidationLink rejects", async () => {
    emailValidationHelperSuccess = false;

    emailValidationPostHook
      .after([testEmailValidation])
      .catch((blErr: BlError) => {
        // @ts-expect-error fixme: auto ignored
        return expect(blErr.errorStack[0].getMsg()).to.be.eql(
          "could not send email validation link",
        );
      });
  });
});
