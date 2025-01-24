import { PermissionService } from "@backend/lib/auth/permission.service.js";
import { Hook } from "@backend/lib/hook/hook.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class PaymentGetAllHook extends Hook {
    async before(body, accessToken, id, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query) {
        if (!PermissionService.isPermissionOver(
        // @ts-expect-error fixme: auto ignored
        accessToken.permission, "customer")) {
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
