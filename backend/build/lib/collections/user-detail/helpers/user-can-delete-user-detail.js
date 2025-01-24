import { PermissionService } from "@backend/lib/auth/permission.service.js";
import { SEDbQueryBuilder } from "@backend/lib/query/se.db-query-builder.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export class UserCanDeleteUserDetail {
    queryBuilder = new SEDbQueryBuilder();
    async canDelete(userIdToDelete, accessToken) {
        const userDetailToDelete = await BlStorage.UserDetails.get(userIdToDelete);
        if (userDetailToDelete.id === accessToken.details) {
            return true;
        }
        if (!PermissionService.isAdmin(accessToken.permission)) {
            return false;
        }
        const databaseQuery = this.queryBuilder.getDbQuery({ username: userDetailToDelete.email }, [{ fieldName: "username", type: "string" }]);
        const users = await BlStorage.Users.getByQuery(databaseQuery);
        const userToDelete = users[0];
        return !(!PermissionService.isPermissionEqualOrOver(accessToken.permission, 
        // @ts-expect-error fixme: auto ignored
        userToDelete.permission) || accessToken.permission === userToDelete.permission);
    }
}
