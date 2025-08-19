import type { HttpContext } from "@adonisjs/core/http";

import { SEDbQuery } from "#services/legacy/query/se.db-query";
import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { uniqueItemsValidator } from "#validators/unique_item";

export default class UniqueItemsController {
  async add(ctx: HttpContext) {
    PermissionService.employeeOrFail(ctx);
    const { blid, isbn } =
      await ctx.request.validateUsing(uniqueItemsValidator);
    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [{ fieldName: "info.isbn", value: isbn }];
    const [item] = await StorageService.Items.getByQuery(databaseQuery);
    if (!item) {
      throw new Error("Item not found.");
    }
    return await StorageService.UniqueItems.add({
      blid,
      item: item.id,
      title: item.title,
    });
  }
}
