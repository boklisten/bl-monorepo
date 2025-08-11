import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { UserProvisioningService } from "#services/user_provisioning_service";
import { userProvisioningValidator } from "#validators/user_provisioning";

export default class UserProvisioningController {
  async createUsers(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    const { userCandidates } = await ctx.request.validateUsing(
      userProvisioningValidator,
    );

    await UserProvisioningService.createUsers(userCandidates);
  }
}
