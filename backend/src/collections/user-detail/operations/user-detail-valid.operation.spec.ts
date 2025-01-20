import "mocha";

import { UserDetailValidOperation } from "@backend/collections/user-detail/operations/user-detail-valid.operation.js";
import { BlApiRequest } from "@backend/request/bl-api-request.js";
import { SEResponseHandler } from "@backend/response/se.response.handler.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("UserDetailValidOperation", () => {
  const responseHandler = new SEResponseHandler();
  const userDetailValidOperation = new UserDetailValidOperation(
    responseHandler,
  );

  let testUserDetail: UserDetail;
  let resHandlerSendResponseStub: sinon.SinonStub;
  let resHandlerSendErrorResponseStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  describe("#run", () => {
    beforeEach(() => {
      sandbox = createSandbox();
      sandbox.stub(BlStorage.UserDetails, "get").callsFake((id) => {
        if (id !== testUserDetail.id) {
          return Promise.reject(new BlError(`userDetail "${id}" not found`));
        }

        return Promise.resolve(testUserDetail);
      });

      resHandlerSendResponseStub = sandbox
        .stub(responseHandler, "sendResponse")
        .callsFake((res: any, blApiResponse: BlapiResponse) => {});

      resHandlerSendErrorResponseStub = sandbox
        .stub(responseHandler, "sendErrorResponse")
        // @ts-expect-error fixme: auto ignored
        .callsFake((res: any, blError: BlError) => {});
    });
    afterEach(() => {
      sandbox.restore();
    });

    it("should reject if userDetail is not found", (done) => {
      testUserDetail = {
        id: "userDetail1",
      } as UserDetail;

      const blApiRequest = {
        documentId: "notFoundUserDetail",
      };

      userDetailValidOperation

        // @ts-expect-error fixme: auto ignored
        .run(blApiRequest, null, null)
        .catch((blError: BlError) => {
          expect(resHandlerSendErrorResponseStub).to.have.been.called;

          expect(blError.getMsg()).to.be.eql(
            "userDetail could not be validated",
          );

          // @ts-expect-error fixme: auto ignored
          expect(blError.errorStack[0].getMsg()).to.be.eql(
            `userDetail "notFoundUserDetail" not found`,
          );
          done();
        });
    });

    context("when user detail is valid", () => {
      beforeEach(() => {
        testUserDetail = {
          id: "userDetail1",
          name: "Freddy Mercury",
          email: "freddy@blapi.co",
          phone: "12345678",
          address: "Star road 1",
          postCode: "0123",
          postCity: "LONDON",
          country: "ENGLAND",
          dob: new Date(1946, 9, 5),
          branch: "branch1",
          emailConfirmed: true,
          signatures: [],
          blid: "",
        };
      });

      it("should send response with {valid: true}", (done) => {
        const blApiRequest = {
          documentId: "userDetail1",
        };

        // @ts-expect-error fixme: auto ignored
        userDetailValidOperation.run(blApiRequest, null, null).then(() => {
          expect(resHandlerSendResponseStub).to.have.been.calledWith(
            null,
            new BlapiResponse([{ valid: true }]),
          );

          done();
        });
      });
    });

    context("when user detail is not valid", () => {
      beforeEach(() => {
        testUserDetail = {
          id: "userDetail1",
          name: "Freddy Mercury",
          email: "freddy@blapi.co",
          phone: "12345678",
          address: "Star road 1",
          postCode: "0123",
          postCity: "LONDON",
          country: "ENGLAND",
          dob: new Date(1946, 9, 5),
          branch: "branch1",
          emailConfirmed: true,
          signatures: [],
          blid: "",
        };
      });

      it("should resolve with valid false if name is not defined", (done) => {
        testUserDetail.name = "";
        const blApiRequest: BlApiRequest = {
          documentId: "userDetail1",
        };

        // @ts-expect-error fixme: auto ignored
        userDetailValidOperation.run(blApiRequest, null, null).then(() => {
          expect(resHandlerSendResponseStub).to.have.been.calledWith(
            null,
            new BlapiResponse([{ valid: false, invalidFields: ["name"] }]),
          );
          done();
        });
      });

      it("should resolve with valid false if address and postCode is not defined", (done) => {
        testUserDetail.address = "";

        // @ts-expect-error fixme: auto ignored
        testUserDetail.postCode = null;
        const blApiRequest: BlApiRequest = {
          documentId: "userDetail1",
        };

        // @ts-expect-error fixme: auto ignored
        userDetailValidOperation.run(blApiRequest, null, null).then(() => {
          expect(resHandlerSendResponseStub).to.have.been.calledWith(
            null,
            new BlapiResponse([
              { valid: false, invalidFields: ["address", "postCode"] },
            ]),
          );
          done();
        });
      });

      it("should resolve with valid false if postCity and phone is not defined", (done) => {
        testUserDetail.postCity = "";

        // @ts-expect-error fixme: auto ignored
        testUserDetail.phone = undefined;
        const blApiRequest: BlApiRequest = {
          documentId: "userDetail1",
        };

        // @ts-expect-error fixme: auto ignored
        userDetailValidOperation.run(blApiRequest, null, null).then(() => {
          expect(resHandlerSendResponseStub).to.have.been.calledWith(
            null,
            new BlapiResponse([
              { valid: false, invalidFields: ["postCity", "phone"] },
            ]),
          );
          done();
        });
      });
      /*
			it('should resolve with valid false if emailConfirmed is not true', (done) => {
				testUserDetail.emailConfirmed = false;
				let blApiRequest: BlApiRequest = {
					documentId: 'userDetail1'
				};

				userDetailValidOperation.run(blApiRequest, null, null).then(() => {
					expect(resHandlerSendResponseStub)
						.to.have.been
						.calledWith(null, new BlapiResponse([{valid: false, invalidFields: ['emailConfirmed']}]));
					done();
				})
			});
      */

      it("should resolve with valid false if dob is not defined", (done) => {
        // @ts-expect-error fixme: auto ignored
        testUserDetail.dob = undefined;
        const blApiRequest: BlApiRequest = {
          documentId: "userDetail1",
        };

        // @ts-expect-error fixme: auto ignored
        userDetailValidOperation.run(blApiRequest, null, null).then(() => {
          expect(resHandlerSendResponseStub).to.have.been.calledWith(
            null,
            new BlapiResponse([{ valid: false, invalidFields: ["dob"] }]),
          );
          done();
        });
      });
    });
  });
});
