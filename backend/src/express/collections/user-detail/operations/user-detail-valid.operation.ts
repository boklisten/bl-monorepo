import { UserDetailHelper } from "@backend/express/collections/user-detail/helpers/user-detail.helper.js";
import BlResponseHandler from "@backend/express/response/bl-response.handler.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Request, Response } from "express";

export class UserDetailValidOperation implements Operation {
  private userDetailHelper = new UserDetailHelper();

  async run(blApiRequest: BlApiRequest, request: Request, res: Response) {
    try {
      const userDetail = await BlStorage.UserDetails.get(
        blApiRequest.documentId,
      );

      const invalidUserDetailFields =
        this.userDetailHelper.getInvalidUserDetailFields(userDetail);

      if (invalidUserDetailFields.length <= 0) {
        BlResponseHandler.sendResponse(
          res,
          new BlapiResponse([{ valid: true }]),
        );
      } else {
        BlResponseHandler.sendResponse(
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

      BlResponseHandler.sendErrorResponse(res, responseError);

      throw responseError;
    }
  }
}
