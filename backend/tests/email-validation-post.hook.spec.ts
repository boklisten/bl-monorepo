import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { EmailValidation } from "#services/collections/email-validation/email-validation";
import EmailValidationHelper from "#services/collections/email-validation/helpers/email-validation.helper";
import { EmailValidationPostHook } from "#services/collections/email-validation/hooks/email-validation-post.hook";
import { BlError } from "#shared/bl-error/bl-error";

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
