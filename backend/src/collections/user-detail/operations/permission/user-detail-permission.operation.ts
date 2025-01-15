import { PermissionService } from "@backend/auth/permission/permission.service";
import { User } from "@backend/collections/user/user";
import { UserModel } from "@backend/collections/user/user.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserPermissionEnum } from "@shared/permission/user-permission";
import { UserDetail } from "@shared/user/user-detail/user-detail";
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
  private userDetailStorage: BlStorage<UserDetail>;
  private userStorage: BlStorage<User>;
  private resHandler: SEResponseHandler;

  constructor(
    userDetailStorage?: BlStorage<UserDetail>,
    userStorage?: BlStorage<User>,
    resHandler?: SEResponseHandler,
  ) {
    this.userDetailStorage =
      userDetailStorage ?? new BlStorage(UserDetailModel);

    this.userStorage = userStorage ?? new BlStorage(UserModel);

    this.resHandler = resHandler ?? new SEResponseHandler();
  }

  async run(
    blApiRequest: BlApiRequest,
    request?: Request,
    res?: Response,
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

    const userDetail = await this.userDetailStorage.get(
      parsedRequest.documentId,
    );

    const users = await this.userStorage.aggregate([
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

    await this.userStorage.update(user.id, { permission: permissionChange });

    // @ts-expect-error fixme: auto ignored
    this.resHandler.sendResponse(res, new BlapiResponse([{ success: true }]));

    return true;
  }
}
