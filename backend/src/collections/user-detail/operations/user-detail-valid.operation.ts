import { UserDetailHelper } from "@backend/collections/user-detail/helpers/user-detail.helper";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/bl-storage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Request, Response } from "express";

export class UserDetailValidOperation implements Operation {
  private userDetailHelper = new UserDetailHelper();

  private resHandler: SEResponseHandler;

  constructor(resHandler?: SEResponseHandler) {
    this.resHandler = resHandler ?? new SEResponseHandler();
  }

  async run(blApiRequest: BlApiRequest, request: Request, res: Response) {
    try {
      const userDetail = await BlStorage.UserDetails.get(
        blApiRequest.documentId,
      );

      const invalidUserDetailFields =
        this.userDetailHelper.getInvalidUserDetailFields(userDetail);

      if (invalidUserDetailFields.length <= 0) {
        this.resHandler.sendResponse(res, new BlapiResponse([{ valid: true }]));
      } else {
        this.resHandler.sendResponse(
          res,
          new BlapiResponse([
            { valid: false, invalidFields: invalidUserDetailFields },
          ]),
        );
      }

      return true;
    } catch (error) {
      const responseError: BlError = new BlError(
        "userDetail could not be validated",
      );

      if (error instanceof BlError) {
        responseError.add(error);
      }

      this.resHandler.sendErrorResponse(res, responseError);

      throw responseError;
    }
  }
}
