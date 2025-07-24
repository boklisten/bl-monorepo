import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/auth/permission.service";
import { BlStorage } from "#services/storage/bl-storage";
import { waitingListEntryValidator } from "#validators/waiting_list";

export default class WaitingListEntriesController {
  async getAllWaitingListEntries(ctx: HttpContext) {
    PermissionService.employeeOrFail(ctx);
    return await BlStorage.WaitingListEntries.getAll();
  }

  async addWaitingListEntry(ctx: HttpContext) {
    PermissionService.employeeOrFail(ctx);
    return await BlStorage.WaitingListEntries.add(
      await ctx.request.validateUsing(waitingListEntryValidator),
    );
  }

  async deleteWaitingListEntry(ctx: HttpContext) {
    PermissionService.employeeOrFail(ctx);
    return await BlStorage.WaitingListEntries.remove(ctx.params["id"]);
  }
}
