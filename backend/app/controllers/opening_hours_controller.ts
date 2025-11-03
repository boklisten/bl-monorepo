import { HttpContext } from "@adonisjs/core/http";

import { SEDbQuery } from "#services/legacy/query/se.db-query";
import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { openingHoursValidator } from "#validators/opening_hours";

export default class OpeningHoursController {
  async get(ctx: HttpContext) {
    const databaseQuery = new SEDbQuery();
    databaseQuery.objectIdFilters = [
      { fieldName: "branch", value: ctx.request.param("id") },
    ];
    databaseQuery.dateFilters = [
      {
        fieldName: "to",
        op: { $gt: new Date() },
      },
    ];
    databaseQuery.sortFilters = [
      {
        fieldName: "from",
        direction: 1,
      },
    ];
    return (
      (await StorageService.OpeningHours.getByQueryOrNull(databaseQuery)) ?? []
    );
  }
  async add(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    const { branchId, from, to } = await ctx.request.validateUsing(
      openingHoursValidator,
    );
    await StorageService.OpeningHours.add({
      branch: branchId,
      from,
      to,
    });
  }
  async delete(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    await StorageService.OpeningHours.remove(ctx.request.param("id"));
  }
}
