import { PermissionService } from "@backend/lib/auth/permission.service.js";
import UserHandler from "@backend/lib/auth/user/user.handler.js";
import { isNotNullish, isNullish, } from "@backend/lib/helper/typescript-helpers.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import validator from "validator";
export class UserDetailChangeEmailOperation {
    async run(blApiRequest) {
        // @ts-expect-error fixme: auto ignored
        const emailChange = blApiRequest.data["email"];
        this.validateEmail(emailChange);
        const userDetail = await BlStorage.UserDetails.get(blApiRequest.documentId);
        const user = await this.getUser(userDetail.email, userDetail.blid);
        const localLogin = await this.getLocalLogin(userDetail.email);
        // @ts-expect-error fixme: auto ignored
        this.validatePermission(blApiRequest.user.permission, user.permission);
        await this.checkIfAlreadyAdded(emailChange);
        await BlStorage.UserDetails.update(userDetail.id, { email: emailChange }, 
        // @ts-expect-error fixme: auto ignored
        blApiRequest.user);
        await BlStorage.Users.update(user.id, { username: emailChange }, 
        // @ts-expect-error fixme: auto ignored
        blApiRequest.user);
        await BlStorage.LocalLogins.update(localLogin.id, { username: emailChange }, 
        // @ts-expect-error fixme: auto ignored
        blApiRequest.user);
        return new BlapiResponse([{ success: true }]);
    }
    async checkIfAlreadyAdded(email) {
        let alreadyAddedUser;
        try {
            alreadyAddedUser = await UserHandler.getByUsername(email);
            // eslint-disable-next-line no-empty
        }
        catch { }
        if (isNotNullish(alreadyAddedUser)) {
            throw new BlError("email is already present in database").code(701);
        }
        return false;
    }
    validatePermission(
    // @ts-expect-error fixme: auto ignored
    userPermission, 
    // @ts-expect-error fixme: auto ignored
    permissionToEmailChangeUser) {
        if (!PermissionService.isPermissionOver(userPermission, permissionToEmailChangeUser)) {
            throw new BlError("no access to change email");
        }
        return true;
    }
    async getUser(email, blid) {
        const users = await BlStorage.Users.aggregate([
            { $match: { username: email, blid: blid } },
        ]);
        // @ts-expect-error fixme: auto ignored
        return users[0];
    }
    async getLocalLogin(username) {
        const localLogins = await BlStorage.LocalLogins.aggregate([
            { $match: { username: username } },
        ]);
        // @ts-expect-error fixme: auto ignored
        return localLogins[0];
    }
    validateEmail(email) {
        if (isNullish(email) || !validator.isEmail(email)) {
            throw new BlError("email is not valid").code(701);
        }
    }
}
