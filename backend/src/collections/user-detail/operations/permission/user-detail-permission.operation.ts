import { PermissionService } from "@backend/auth/permission/permission.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { User } from "@backend/collections/user/user";
import { userSchema } from "@backend/collections/user/userSchema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
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
  private readonly _permissionService: PermissionService;
  private readonly _userDetailStorage: BlDocumentStorage<UserDetail>;
  private readonly _userStorage: BlDocumentStorage<User>;
  private readonly _resHandler: SEResponseHandler;

  constructor(
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    userStorage?: BlDocumentStorage<User>,
    resHandler?: SEResponseHandler,
  ) {
    this._userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);

    this._userStorage =
      userStorage ?? new BlDocumentStorage(BlCollectionName.Users, userSchema);

    this._resHandler = resHandler ?? new SEResponseHandler();

    this._permissionService = new PermissionService();
  }

  async run(
    blApiRequest: BlApiRequest,
    _request?: Request,
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

    const userDetail = await this._userDetailStorage.get(
      parsedRequest.documentId,
    );

    const users = await this._userStorage.aggregate([
      { $match: { blid: userDetail.blid } },
    ]);
    const user = z
      .object({ id: z.string(), permission: UserPermissionEnum })
      .parse(users[0]);

    if (
      !this._permissionService.isAdmin(parsedRequest.user.permission) ||
      !this._permissionService.isPermissionOver(
        parsedRequest.user.permission,
        user.permission,
      ) ||
      !this._permissionService.isPermissionOver(
        parsedRequest.user.permission,
        permissionChange,
      )
    ) {
      throw new BlError("no access to change permission").code(904);
    }

    await this._userStorage.update(user.id, { permission: permissionChange });

    // @ts-expect-error fixme: auto ignored
    this._resHandler.sendResponse(res, new BlapiResponse([{ success: true }]));

    return true;
  }
}
