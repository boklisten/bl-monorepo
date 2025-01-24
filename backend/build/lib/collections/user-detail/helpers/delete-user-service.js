import { SEDbQueryBuilder } from "@backend/lib/query/se.db-query-builder.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export class DeleteUserService {
    queryBuilder = new SEDbQueryBuilder();
    async deleteUser(userDetailId) {
        const databaseQuery = this.queryBuilder.getDbQuery({ userDetail: userDetailId }, [{ fieldName: "userDetail", type: "object-id" }]);
        const users = await BlStorage.Users.getByQuery(databaseQuery);
        for (const user of users) {
            await BlStorage.Users.remove(user.id);
            await this.removeLocalLogin(user.username);
        }
    }
    async removeLocalLogin(username) {
        const localLoginDatabaseQuery = this.queryBuilder.getDbQuery({ username: username }, [{ fieldName: "username", type: "string" }]);
        const localLogins = await BlStorage.LocalLogins.getByQuery(localLoginDatabaseQuery);
        for (const localLogin of localLogins) {
            await BlStorage.LocalLogins.remove(localLogin.id);
        }
    }
    async mergeIntoOtherUser(fromUser, toUser) {
        const [fromUserDetails, toUserDetails] = await Promise.all([
            BlStorage.UserDetails.get(fromUser),
            BlStorage.UserDetails.get(toUser),
        ]);
        const newOrderRefs = [
            ...(fromUserDetails.orders ?? []),
            ...(toUserDetails.orders ?? []),
        ];
        const newCustomerItemRefs = [
            ...(fromUserDetails.customerItems ?? []),
            ...(toUserDetails.customerItems ?? []),
        ];
        const newSignatureRefs = [
            ...fromUserDetails.signatures,
            ...toUserDetails.signatures,
        ];
        await Promise.all([
            BlStorage.UserDetails.update(toUser, {
                orders: newOrderRefs,
                customerItems: newCustomerItemRefs,
                signatures: newSignatureRefs,
            }),
            BlStorage.CustomerItems.updateMany({ customer: fromUser }, { customer: toUser }),
            BlStorage.Invoices.updateMany({
                customerInfo: {
                    userDetail: fromUser,
                },
            }, {
                customerInfo: {
                    userDetail: toUser,
                },
            }),
            BlStorage.Orders.updateMany({
                placed: true,
                customer: fromUser,
            }, { customer: toUser }),
            BlStorage.Payments.updateMany({
                customer: fromUser,
            }, { customer: toUser }),
            BlStorage.StandMatches.updateMany({ customer: fromUser }, { customer: toUser }),
            BlStorage.UserMatches.updateMany({
                customerA: fromUser,
            }, { customerA: toUser }),
            BlStorage.UserMatches.updateMany({
                customerB: fromUser,
            }, { customerB: toUser }),
        ]);
    }
}
