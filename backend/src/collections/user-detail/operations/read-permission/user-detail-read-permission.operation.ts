import BlResponseHandler from "@backend/response/bl-response.handler.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Request, Response } from "express";

export class UserDetailReadPermissionOperation implements Operation {
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

    BlResponseHandler.sendResponse(
      res,
      // @ts-expect-error fixme: auto ignored
      new BlapiResponse([{ permission: user.permission }]),
    );
    return true;
  }
}
