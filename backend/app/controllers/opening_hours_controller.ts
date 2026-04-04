import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { openingHoursValidator } from "#validators/opening_hours";
import OpeningHour from "#models/opening_hour";
import { DateTime } from "luxon";

export default class OpeningHoursController {
  async get(ctx: HttpContext) {
    return (await OpeningHour.findManyBy("branchId", ctx.request.param("branchId"))).map(
      ({ id, branchId, from, to }) => ({
        id,
        branchId,
        from: from.toJSDate(),
        to: to.toJSDate(),
      }),
    );
  }
  async add(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    const { branchId, from, to } = await ctx.request.validateUsing(openingHoursValidator);
    await OpeningHour.create({
      branchId,
      from: DateTime.fromJSDate(from),
      to: DateTime.fromJSDate(to),
    });
  }
  async delete(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    const openingHour = await OpeningHour.findOrFail(ctx.request.param("id"));
    await openingHour.delete();
  }
}
