import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { EmailValidation } from "#services/collections/email-validation/email-validation";
import { EmailValidationConfirmOperation } from "#services/collections/email-validation/operations/email-validation-confirm.operation";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { UserDetail } from "#shared/user/user-detail/user-detail";

chaiUse(chaiAsPromised);
should();

test.group("EmailValidationConfirmOperation", (group) => {
  const emailValidationConfirmOperation = new EmailValidationConfirmOperation();
  let sandbox: sinon.SinonSandbox;

  const testUserDetail: UserDetail = {
    id: "userDetail1",
    emailConfirmed: false,
  } as UserDetail;
  let testEmailValidation: EmailValidation;

  group.each.setup(() => {
    testUserDetail.id = "userDetail1";
    testUserDetail.emailConfirmed = false;

    testEmailValidation = {
      id: "emailValidation1",
      userDetail: "userDetail1",
      email: testUserDetail.email,
    };

    sandbox = createSandbox();
    sandbox.stub(BlStorage.EmailValidations, "get").callsFake((id) => {
      if (id !== testEmailValidation.id) {
        return Promise.reject(new BlError("not found"));
      }

      return Promise.resolve(testEmailValidation);
    });
    sandbox.stub(BlStorage.UserDetails, "get").callsFake((id) => {
      if (id !== testUserDetail.id) {
        return Promise.reject(new BlError("not found"));
      }

      return Promise.resolve(testUserDetail);
    });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if no documentId is provided", async () => {
    const blApiRequest = {};

    emailValidationConfirmOperation
      .run(blApiRequest)
      .catch((blError: BlError) => {
        expect(blError.getMsg()).to.be.eql(`no documentId provided`);
      });
  });

  test("should reject if emailValidation is not found by id", async ({
    assert,
  }) => {
    const blApiRequest = {
      documentId: "notFoundEmailValidation",
    };

    await assert.rejects(() =>
      emailValidationConfirmOperation.run(blApiRequest),
    );
  });

  test("should reject if userDetail is not found", async ({ assert }) => {
    const blApiRequest = {
      documentId: testEmailValidation.id,
    };

    testEmailValidation.userDetail = "notFoundUserDetail";

    await assert.rejects(() =>
      emailValidationConfirmOperation.run(blApiRequest),
    );
  });

  test("should update userDetail with emailConfirmed if all valid inputs are provided", async ({
    assert,
  }) => {
    const blApiRequest = {
      documentId: testEmailValidation.id,
    };

    sandbox.stub(BlStorage.UserDetails, "update");
    const result = await emailValidationConfirmOperation.run(blApiRequest);
    assert.deepEqual(result, new BlapiResponse([{ confirmed: true }]));
  });
});
