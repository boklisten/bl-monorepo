import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { branchCreateValidator, branchValidator } from "#validators/branch";

export default class BranchesController {
  async add(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    const branchData = await ctx.request.validateUsing(branchCreateValidator);
    return await StorageService.Branches.add(branchData);
  }
  async update(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    const branchData = await ctx.request.validateUsing(branchValidator);
    if (!branchData?.id) throw new Error("Id is required to update branch");

    return await StorageService.Branches.update(branchData.id, branchData);
  }
}
