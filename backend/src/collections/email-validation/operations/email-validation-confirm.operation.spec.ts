import "mocha";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { EmailValidation } from "@backend/collections/email-validation/email-validation";
import { EmailValidationConfirmOperation } from "@backend/collections/email-validation/operations/email-validation-confirm.operation";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Request, Response } from "express";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("EmailValidationConfirmOperation", () => {
  const emailValidationStorage = new BlDocumentStorage<EmailValidation>(
    BlCollectionName.EmailValidations,
  );
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const resHandler = new SEResponseHandler();
  const emailValidationConfirmOperation = new EmailValidationConfirmOperation(
    emailValidationStorage,
    resHandler,
    userDetailStorage,
  );

  const testUserDetail: UserDetail = {
    id: "userDetail1",
    emailConfirmed: false,
  } as UserDetail;
  let testEmailValidation: EmailValidation;
  let testUserDetailUpdateSucess: boolean;

  beforeEach(() => {
    testUserDetail.id = "userDetail1";
    testUserDetail.emailConfirmed = false;

    testEmailValidation = {
      id: "emailValidation1",
      userDetail: "userDetail1",
      email: testUserDetail.email,
    };

    testUserDetailUpdateSucess = true;
  });

  const resHandlerSendErrorStub = sinon
    .stub(resHandler, "sendErrorResponse")
    .callsFake(() => {});

  const resHandlerSendResponseStub = sinon
    .stub(resHandler, "sendResponse")
    .callsFake(() => {});

  sinon.stub(emailValidationStorage, "get").callsFake((id: string) => {
    if (id !== testEmailValidation.id) {
      return Promise.reject(new BlError("not found"));
    }

    return Promise.resolve(testEmailValidation);
  });

  sinon.stub(userDetailStorage, "get").callsFake((id: string) => {
    if (id !== testUserDetail.id) {
      return Promise.reject(new BlError("not found"));
    }

    return Promise.resolve(testUserDetail);
  });

  const userDetailStorageUpdateStub = sinon
    .stub(userDetailStorage, "update")
    .callsFake((id: string, data: any) => {
      if (id !== testUserDetail.id) {
        return Promise.reject(new BlError("not found"));
      }

      if (!testUserDetailUpdateSucess) {
        return Promise.reject(new BlError("could not update"));
      }

      return Promise.resolve(testUserDetail);
    });

  describe("#run", () => {
    it("should reject if no documentId is provided", (done) => {
      const blApiRequest = {};

      emailValidationConfirmOperation
        .run(blApiRequest)
        .catch((blError: BlError) => {
          expect(blError.getMsg()).to.be.eql(`no documentId provided`);
          expect(resHandlerSendErrorStub.called);
          done();
        });
    });

    it("should reject if emailValidation is not found by id", (done) => {
      const blApiRequest = {
        documentId: "notFoundEmailValidation",
      };

      emailValidationConfirmOperation
        .run(blApiRequest)
        .catch((blErr: BlError) => {
          expect(resHandlerSendErrorStub.called);
          expect(blErr.getCode()).to.be.eql(702);
          done();
        });
    });

    it("should reject if userDetail is not found", () => {
      const blApiRequest = {
        documentId: testEmailValidation.id,
      };

      testEmailValidation.userDetail = "notFoundUserDetail";

      expect(
        emailValidationConfirmOperation.run(blApiRequest),
      ).to.be.rejectedWith(BlError, /could not update userDetail/);
    });

    it("should update userDetail with emailConfirmed if all valid inputs are provided", (done) => {
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

          expect(resHandlerSendResponseStub).to.have.been.calledWith(
            {},
            new BlapiResponse([{ confirmed: true }]),
          );

          done();
        });
    });
  });
});
