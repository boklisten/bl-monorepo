import { EmailValidation } from "@backend/express/collections/email-validation/email-validation.js";
import { EmailValidationConfirmOperation } from "@backend/express/collections/email-validation/operations/email-validation-confirm.operation.js";
import BlResponseHandler from "@backend/express/response/bl-response.handler.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("EmailValidationConfirmOperation", (group) => {
  const emailValidationConfirmOperation = new EmailValidationConfirmOperation();
  let sandbox: sinon.SinonSandbox;
  let resHandlerSendErrorStub: sinon.SinonStub;

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

    resHandlerSendErrorStub = sandbox.stub(
      BlResponseHandler,
      "sendErrorResponse",
    );
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
        return expect(resHandlerSendErrorStub.called);
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
