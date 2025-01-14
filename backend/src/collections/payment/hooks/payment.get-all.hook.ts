import { PermissionService } from "@backend/auth/permission/permission.service";
import { Hook } from "@backend/hook/hook";
import { BlError } from "@shared/bl-error/bl-error";
import { AccessToken } from "@shared/token/access-token";

export class PaymentGetAllHook extends Hook {
  private _permissionService: PermissionService;

  constructor() {
    super();
    this._permissionService = new PermissionService();
  }

  public override async before(
    body: unknown,
    accessToken?: AccessToken,
    id?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query?: any,
  ): Promise<boolean> {
    if (
      !this._permissionService.isPermissionOver(
        // @ts-expect-error fixme: auto ignored
        accessToken.permission,
        "customer",
      )
    ) {
      if (!query || !query["info.paymentId"]) {
        throw new BlError("no permission");
      }

      if (query["info.paymentId"].length <= 10) {
        throw new BlError("no permission");
      }
    }

    return true;
  }
}
