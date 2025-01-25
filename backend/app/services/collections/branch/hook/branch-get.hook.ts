import { Branch } from "@shared/branch/branch.js";
import { AccessToken } from "@shared/token/access-token.js";

import { PermissionService } from "#services/auth/permission.service";
import { Hook } from "#services/hook/hook";

export class BranchGetHook extends Hook {
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
          PermissionService.isPermissionEqualOrOver(
            accessToken.permission,
            "admin",
          )
        ) {
          return; // admin should always get the branchItems
        }

        // have a user
        if (
          PermissionService.isPermissionEqualOrOver(
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
