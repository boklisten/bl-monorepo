import { PermissionService } from "@backend/lib/auth/permission.service.js";
import { Hook } from "@backend/lib/hook/hook.js";
export class BranchGetHook extends Hook {
    after(branches, accessToken) {
        for (const branch of branches)
            this.resolveBranchItems(branch, accessToken);
        return Promise.resolve(branches);
    }
    resolveBranchItems(branch, accessToken) {
        if (branch.isBranchItemsLive !== undefined &&
            branch.isBranchItemsLive !== null) {
            if (accessToken) {
                if (PermissionService.isPermissionEqualOrOver(accessToken.permission, "admin")) {
                    return; // admin should always get the branchItems
                }
                // have a user
                if (PermissionService.isPermissionEqualOrOver(accessToken.permission, "employee")) {
                    if (!branch.isBranchItemsLive.atBranch) {
                        branch.branchItems = [];
                    }
                }
                else {
                    // user is customer
                    if (!branch.isBranchItemsLive.online) {
                        // user must be "online" (bl-web)
                        branch.branchItems = [];
                    }
                }
            }
            else {
                // no user found must be "online" (bl-web)
                if (!branch.isBranchItemsLive.online) {
                    // should not show branchItems
                    branch.branchItems = [];
                }
            }
        }
    }
}
