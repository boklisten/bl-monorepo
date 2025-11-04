import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";

export default class ItemsController {
  async get(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    return (await StorageService.Items.getAll()).sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }
}
