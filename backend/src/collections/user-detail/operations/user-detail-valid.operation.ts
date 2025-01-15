import { UserDetailHelper } from "@backend/collections/user-detail/helpers/user-detail.helper";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { Request, Response } from "express";

export class UserDetailValidOperation implements Operation {
  private userDetailHelper = new UserDetailHelper();
  private userDetailStorage: BlStorage<UserDetail>;
  private resHandler: SEResponseHandler;

  constructor(
    userDetailStorage?: BlStorage<UserDetail>,
    resHandler?: SEResponseHandler,
  ) {
    this.userDetailStorage =
      userDetailStorage ?? new BlStorage(UserDetailModel);
    this.resHandler = resHandler ?? new SEResponseHandler();
  }

  async run(
    blApiRequest: BlApiRequest,
    request?: Request,
    res?: Response,
  ): Promise<boolean> {
    try {
      const userDetail = await this.userDetailStorage.get(
        // @ts-expect-error fixme: auto ignored
        blApiRequest.documentId,
      );

      const invalidUserDetailFields =
        this.userDetailHelper.getInvalidUserDetailFields(userDetail);

      if (invalidUserDetailFields.length <= 0) {
        this.resHandler.sendResponse(
          // @ts-expect-error fixme: auto ignored
          res,
          new BlapiResponse([{ valid: true }]),
        );
      } else {
        this.resHandler.sendResponse(
          // @ts-expect-error fixme: auto ignored
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

      // @ts-expect-error fixme: auto ignored
      this.resHandler.sendErrorResponse(res, responseError);

      throw responseError;
    }
  }
}
