import { PermissionService } from "@backend/express/auth/permission.service.js";
import BlResponseHandler from "@backend/express/response/bl-response.handler.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { UserPermissionEnum } from "@shared/permission/user-permission.js";
import { Request, Response } from "express";
import { z } from "zod";
import { fromError } from "zod-validation-error";

const UserDetailPermissionSpec = z.object({
  documentId: z.string(),
  data: z.object({
    permission: UserPermissionEnum,
  }),
  user: z.object({
    id: z.string(),
    permission: UserPermissionEnum,
  }),
});

export class UserDetailPermissionOperation implements Operation {
  async run(
    blApiRequest: BlApiRequest,
    request: Request,
    res: Response,
  ): Promise<boolean> {
    const {
      data: parsedRequest,
      success,
      error,
    } = UserDetailPermissionSpec.safeParse(blApiRequest);
    if (!success) {
      throw new BlError(fromError(error).toString()).code(701);
    }
    const permissionChange = parsedRequest.data.permission;

    if (parsedRequest.documentId == parsedRequest.user.id) {
      throw new BlError("user can not change own permission");
    }

    const userDetail = await BlStorage.UserDetails.get(
      parsedRequest.documentId,
    );

    const users = await BlStorage.Users.aggregate([
      { $match: { blid: userDetail.blid } },
    ]);
    const user = z
      .object({ id: z.string(), permission: UserPermissionEnum })
      .parse(users[0]);

    if (
      !PermissionService.isAdmin(parsedRequest.user.permission) ||
      !PermissionService.isPermissionOver(
        parsedRequest.user.permission,
        user.permission,
      ) ||
      !PermissionService.isPermissionOver(
        parsedRequest.user.permission,
        permissionChange,
      )
    ) {
      throw new BlError("no access to change permission").code(904);
    }

    await BlStorage.Users.update(user.id, { permission: permissionChange });

    BlResponseHandler.sendResponse(res, new BlapiResponse([{ success: true }]));

    return true;
  }
}
