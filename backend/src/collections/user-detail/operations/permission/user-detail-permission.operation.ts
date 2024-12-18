import { PermissionService } from "@backend/auth/permission/permission.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { User } from "@backend/collections/user/user";
import { UserSchema } from "@backend/collections/user/user.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { Request, Response } from "express";

export class UserDetailPermissionOperation implements Operation {
  private _permissionService: PermissionService;

  constructor(
    private _userDetailStorage?: BlDocumentStorage<UserDetail>,
    private _userStorage?: BlDocumentStorage<User>,
    private _resHandler?: SEResponseHandler,
  ) {
    this._userDetailStorage = _userDetailStorage
      ? _userDetailStorage
      : new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);

    this._userStorage = _userStorage
      ? _userStorage
      : new BlDocumentStorage(BlCollectionName.Users, UserSchema);

    this._resHandler = _resHandler ? _resHandler : new SEResponseHandler();

    this._permissionService = new PermissionService();
  }

  async run(
    blApiRequest: BlApiRequest,
    _request?: Request,
    res?: Response,
  ): Promise<boolean> {
    if (!this._permissionService.hasPermissionField(blApiRequest.data)) {
      throw new BlError("permission is not valid or not provided").code(701);
    }

    const permissionChange = blApiRequest.data.permission;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (blApiRequest.documentId == blApiRequest.user.id) {
      throw new BlError("user can not change own permission");
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userDetail = await this._userDetailStorage.get(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      blApiRequest.documentId,
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const users = await this._userStorage.aggregate([
      { $match: { blid: userDetail.blid } },
    ]);
    const user = users[0];

    if (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !this._permissionService.isAdmin(blApiRequest.user.permission) ||
      !this._permissionService.isPermissionOver(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        blApiRequest.user.permission,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.permission,
      ) ||
      !this._permissionService.isPermissionOver(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        blApiRequest.user.permission,
        permissionChange,
      )
    ) {
      throw new BlError("no access to change permission").code(904);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this._userStorage.update(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      user.id,
      { permission: permissionChange },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      blApiRequest.user,
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._resHandler.sendResponse(res, new BlapiResponse([{ success: true }]));

    return true;
  }
}
