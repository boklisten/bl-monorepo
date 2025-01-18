import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/bl-storage";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Request, Response } from "express";

export class UserDetailReadPermissionOperation implements Operation {
  private resHandler: SEResponseHandler;

  constructor(resHandler?: SEResponseHandler) {
    this.resHandler = resHandler ?? new SEResponseHandler();
  }

  async run(
    blApiRequest: BlApiRequest,
    request: Request,
    res: Response,
  ): Promise<boolean> {
    const userDetail = await BlStorage.UserDetails.get(blApiRequest.documentId);

    const users = await BlStorage.Users.aggregate([
      { $match: { blid: userDetail.blid } },
    ]);
    const user = users[0];

    this.resHandler.sendResponse(
      res,
      // @ts-expect-error fixme: auto ignored
      new BlapiResponse([{ permission: user.permission }]),
    );
    return true;
  }
}
