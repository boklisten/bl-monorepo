import { PermissionService } from "@backend/auth/permission/permission.service";
import { Hook } from "@backend/hook/hook";
import { BlError } from "@shared/bl-error/bl-error";
import { Payment } from "@shared/payment/payment";
import { AccessToken } from "@shared/token/access-token";

export class PaymentGetAllHook extends Hook {
  private _permissionService: PermissionService;

  constructor() {
    super();
    this._permissionService = new PermissionService();
  }

  public override async before(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
    accessToken?: AccessToken,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    id?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query?: any,
  ): Promise<boolean> {
    if (
      !this._permissionService.isPermissionOver(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public override async after(payments: Payment[]): Promise<any> {
    return payments;
  }
}
