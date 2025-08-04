import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { waitingListEntryValidator } from "#validators/waiting_list";

export default class WaitingListEntriesController {
  async getAllWaitingListEntries(ctx: HttpContext) {
    PermissionService.employeeOrFail(ctx);
    return await StorageService.WaitingListEntries.getAll();
  }

  async addWaitingListEntry(ctx: HttpContext) {
    PermissionService.employeeOrFail(ctx);
    return await StorageService.WaitingListEntries.add(
      await ctx.request.validateUsing(waitingListEntryValidator),
    );
  }

  async deleteWaitingListEntry(ctx: HttpContext) {
    PermissionService.employeeOrFail(ctx);
    return await StorageService.WaitingListEntries.remove(ctx.params["id"]);
  }
}
