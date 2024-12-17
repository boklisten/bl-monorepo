import "mocha";
import { BlapiResponse, BlError, UserDetail } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { BlCollectionName } from "@/collections/bl-collection";
import { UserDetailValidOperation } from "@/collections/user-detail/operations/user-detail-valid.operation";
import { BlApiRequest } from "@/request/bl-api-request";
import { SEResponseHandler } from "@/response/se.response.handler";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

chai.use(chaiAsPromised);

describe("UserDetailValidOperation", () => {
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const responseHandler = new SEResponseHandler();
  const userDetailValidOperation = new UserDetailValidOperation(
    userDetailStorage,
    responseHandler,
  );

  let testUserDetail: UserDetail;

  describe("#run", () => {
    sinon.stub(userDetailStorage, "get").callsFake((id: string) => {
      if (id !== testUserDetail.id) {
        return Promise.reject(new BlError(`userDetail "${id}" not found`));
      }

      return Promise.resolve(testUserDetail);
    });

    const resHandlerSendResponseStub = sinon
      .stub(responseHandler, "sendResponse") // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .callsFake((res: any, blApiResponse: BlapiResponse) => {});

    const resHandlerSendErrorResponseStub = sinon
      .stub(responseHandler, "sendErrorResponse") // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .callsFake((res: any, blError: BlError) => {});

    it("should reject if userDetail is not found", (done) => {
      testUserDetail = {
        id: "userDetail1",
      } as UserDetail;

      const blApiRequest = {
        documentId: "notFoundUserDetail",
      };

      userDetailValidOperation
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .run(blApiRequest, null, null)
        .catch((blError: BlError) => {
          expect(resHandlerSendErrorResponseStub).to.have.been.called;

          expect(blError.getMsg()).to.be.eql(
            "userDetail could not be validated",
          );

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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
        };
      });

      it("should send response with {valid: true}", (done) => {
        const blApiRequest = {
          documentId: "userDetail1",
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
        };
      });

      it("should resolve with valid false if name is not defined", (done) => {
        testUserDetail.name = "";
        const blApiRequest: BlApiRequest = {
          documentId: "userDetail1",
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testUserDetail.postCode = null;
        const blApiRequest: BlApiRequest = {
          documentId: "userDetail1",
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testUserDetail.phone = undefined;
        const blApiRequest: BlApiRequest = {
          documentId: "userDetail1",
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testUserDetail.dob = undefined;
        const blApiRequest: BlApiRequest = {
          documentId: "userDetail1",
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
