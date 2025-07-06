import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/auth/permission.service";
import CollectionEndpointAuth from "#services/collection-endpoint/collection-endpoint-auth";
import { BlStorage } from "#services/storage/bl-storage";
import { waitingListEntryValidator } from "#validators/waiting_list";

async function canAccess(ctx: HttpContext) {
  try {
    const accessToken = await CollectionEndpointAuth.authenticate(
      { permission: "employee" },
      ctx,
    );
    return !!(
      accessToken &&
      PermissionService.isPermissionEqualOrOver(
        accessToken?.["permission"],
        "employee",
      )
    );
  } catch {
    return false;
  }
}

export default class WaitingListEntriesController {
  async getAllWaitingListEntries(ctx: HttpContext) {
    if (!(await canAccess(ctx))) {
      return ctx.response.unauthorized();
    }
    return await BlStorage.WaitingListEntries.getAll();
  }

  async addWaitingListEntry(ctx: HttpContext) {
    if (!(await canAccess(ctx))) {
      return ctx.response.unauthorized();
    }
    const newEntry = await ctx.request.validateUsing(waitingListEntryValidator);
    return await BlStorage.WaitingListEntries.add({ id: "", ...newEntry });
  }

  async deleteWaitingListEntry(ctx: HttpContext) {
    if (!(await canAccess(ctx))) {
      return ctx.response.unauthorized();
    }
    return await BlStorage.WaitingListEntries.remove(ctx.params["id"]);
  }
}
