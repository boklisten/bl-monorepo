import { PermissionService } from "@backend/auth/permission/permission.service";
import { Hook } from "@backend/hook/hook";
import { Branch } from "@shared/branch/branch";
import { AccessToken } from "@shared/token/access-token";

export class BranchGetHook extends Hook {
  private permissionService: PermissionService;

  constructor() {
    super();
    this.permissionService = new PermissionService();
  }

  public override after(
    branches: Branch[],
    accessToken: AccessToken,
  ): Promise<Branch[]> {
    for (const branch of branches) this.resolveBranchItems(branch, accessToken);

    return Promise.resolve(branches);
  }

  private resolveBranchItems(branch: Branch, accessToken: AccessToken) {
    if (
      branch.isBranchItemsLive !== undefined &&
      branch.isBranchItemsLive !== null
    ) {
      if (accessToken) {
        if (
          this.permissionService.isPermissionEqualOrOver(
            accessToken.permission,
            "admin",
          )
        ) {
          return; // admin should always get the branchItems
        }

        // have a user
        if (
          this.permissionService.isPermissionEqualOrOver(
            accessToken.permission,
            "employee",
          )
        ) {
          if (!branch.isBranchItemsLive.atBranch) {
            branch.branchItems = [];
          }
        } else {
          // user is customer
          if (!branch.isBranchItemsLive.online) {
            // user must be "online" (bl-web)
            branch.branchItems = [];
          }
        }
      } else {
        // no user found must be "online" (bl-web)
        if (!branch.isBranchItemsLive.online) {
          // should not show branchItems
          branch.branchItems = [];
        }
      }
    }
  }
}
