import { HttpContext } from "@adonisjs/core/http";

import { OrderEmailHandler } from "#services/messenger/email/order_email_handler";
import { PermissionService } from "#services/permission_service";
import { BlStorage } from "#services/storage/bl-storage";

export default class SignaturesController {
  // fixme: improve error handling here, and make it possible to send for people over 18
  async sendSignatureLink(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    const detailsId = ctx.request.param("detailsId");
    const userDetail = await BlStorage.UserDetails.getOrNull(detailsId);
    const branch = await BlStorage.Branches.getOrNull(
      userDetail?.branchMembership,
    );
    if (userDetail) {
      await new OrderEmailHandler().requestGuardianSignature(
        userDetail,
        branch?.name ?? "en filial",
      );
    }
  }
}
