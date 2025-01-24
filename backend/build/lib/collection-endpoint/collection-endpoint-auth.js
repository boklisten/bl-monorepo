import { PermissionService } from "@backend/lib/auth/permission.service.js";
import { isNotNullish } from "@backend/lib/helper/typescript-helpers.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import passport from "passport";
function validateAuth(restriction, accessToken) {
    if (!accessToken) {
        throw new BlError("accessToken invalid").code(910);
    }
    if (restriction &&
        !PermissionService.isPermissionEqualOrOver(accessToken.permission, restriction.permission)) {
        throw new BlError(`user "${accessToken.sub}" with permission "${accessToken.permission}" does not have access to this endpoint`).code(904);
    }
    return true;
}
function authenticate(restriction, ctx) {
    return new Promise((resolve, reject) => {
        const authHeader = ctx.request.headers()["authorization"];
        if (restriction || isNotNullish(authHeader)) {
            // it is a restriction on this endpoint and authentication is required, also try if there are sent with a auth header
            passport.authenticate("jwt", (_error, tokens) => {
                try {
                    validateAuth(restriction, tokens.accessToken);
                    return resolve(tokens.accessToken);
                }
                catch (error) {
                    // if authorization tokens is not valid
                    return reject(error);
                }
            })({ headers: { authorization: authHeader } });
        }
        else {
            // no authentication needed
            return resolve(undefined);
        }
    });
}
const CollectionEndpointAuth = {
    authenticate,
};
export default CollectionEndpointAuth;
