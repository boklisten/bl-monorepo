import { Hook } from "#services/hook/hook";
import { PermissionService } from "#services/permission_service";
import { BlError } from "#shared/bl-error/bl-error";
import { AccessToken } from "#shared/token/access-token";

export class PaymentGetAllHook extends Hook {
  public override async before(
    body: unknown,
    accessToken?: AccessToken,
    id?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query?: any,
  ): Promise<boolean> {
    if (
      !PermissionService.isPermissionOver(
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
