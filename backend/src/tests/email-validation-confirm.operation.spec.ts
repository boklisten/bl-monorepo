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
import { Request, Response } from "express";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("EmailValidationConfirmOperation", (group) => {
  const emailValidationConfirmOperation = new EmailValidationConfirmOperation();
  let sandbox: sinon.SinonSandbox;
  let userDetailStorageUpdateStub: sinon.SinonStub;
  let resHandlerSendErrorStub: sinon.SinonStub;
  let resHandlerSendResponseStub: sinon.SinonStub;

  const testUserDetail: UserDetail = {
    id: "userDetail1",
    emailConfirmed: false,
  } as UserDetail;
  let testEmailValidation: EmailValidation;
  let testUserDetailUpdateSucess: boolean;

  group.each.setup(() => {
    testUserDetail.id = "userDetail1";
    testUserDetail.emailConfirmed = false;

    testEmailValidation = {
      id: "emailValidation1",
      userDetail: "userDetail1",
      email: testUserDetail.email,
    };

    testUserDetailUpdateSucess = true;

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

    userDetailStorageUpdateStub = sandbox
      .stub(BlStorage.UserDetails, "update")
      .callsFake((id) => {
        if (id !== testUserDetail.id) {
          return Promise.reject(new BlError("not found"));
        }

        if (!testUserDetailUpdateSucess) {
          return Promise.reject(new BlError("could not update"));
        }

        return Promise.resolve(testUserDetail);
      });

    resHandlerSendErrorStub = sandbox.stub(
      BlResponseHandler,
      "sendErrorResponse",
    );

    resHandlerSendResponseStub = sandbox.stub(
      BlResponseHandler,
      "sendResponse",
    );
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if no documentId is provided", async () => {
    const blApiRequest = {};

    emailValidationConfirmOperation
      // @ts-expect-error fixme missing params
      .run(blApiRequest)
      .catch((blError: BlError) => {
        expect(blError.getMsg()).to.be.eql(`no documentId provided`);
        return expect(resHandlerSendErrorStub.called);
      });
  });

  test("should reject if emailValidation is not found by id", async () => {
    const blApiRequest = {
      documentId: "notFoundEmailValidation",
    };

    emailValidationConfirmOperation
      // @ts-expect-error fixme missing params
      .run(blApiRequest)
      .catch((blErr: BlError) => {
        expect(resHandlerSendErrorStub.called);
        return expect(blErr.getCode()).to.be.eql(702);
      });
  });

  test("should reject if userDetail is not found", async () => {
    const blApiRequest = {
      documentId: testEmailValidation.id,
    };

    testEmailValidation.userDetail = "notFoundUserDetail";

    return expect(
      // @ts-expect-error fixme missing params
      emailValidationConfirmOperation.run(blApiRequest),
    ).to.be.rejectedWith(BlError, /could not update userDetail/);
  });

  test("should update userDetail with emailConfirmed if all valid inputs are provided", async () => {
    const blApiRequest = {
      documentId: testEmailValidation.id,
    };

    emailValidationConfirmOperation
      .run(blApiRequest, {} as Request, {} as Response)
      .then(() => {
        expect(userDetailStorageUpdateStub).to.have.been.calledWith(
          testEmailValidation.userDetail,
          {
            emailConfirmed: true,
          },
        );

        return expect(resHandlerSendResponseStub).to.have.been.calledWith(
          {},
          new BlapiResponse([{ confirmed: true }]),
        );
      });
  });
});
