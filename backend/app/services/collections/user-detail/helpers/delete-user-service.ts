import { SEDbQueryBuilder } from "#services/query/se.db-query-builder";
import { BlStorage } from "#services/storage/bl-storage";

export class DeleteUserService {
  private queryBuilder = new SEDbQueryBuilder();

  public async deleteUser(userDetailId: string): Promise<void> {
    const databaseQuery = this.queryBuilder.getDbQuery(
      { userDetail: userDetailId },
      [{ fieldName: "userDetail", type: "object-id" }],
    );
    const users = await BlStorage.Users.getByQuery(databaseQuery);
    for (const user of users) {
      await BlStorage.Users.remove(user.id);
    }
  }

  async mergeIntoOtherUser(fromUser: string, toUser: string): Promise<void> {
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
      BlStorage.CustomerItems.updateMany(
        { customer: fromUser },
        { customer: toUser },
      ),
      BlStorage.Invoices.updateMany(
        {
          customerInfo: {
            userDetail: fromUser,
          },
        },
        {
          customerInfo: {
            userDetail: toUser,
          },
        },
      ),
      BlStorage.Orders.updateMany(
        {
          placed: true,
          customer: fromUser,
        },
        { customer: toUser },
      ),
      BlStorage.Payments.updateMany(
        {
          customer: fromUser,
        },
        { customer: toUser },
      ),
      BlStorage.StandMatches.updateMany(
        { customer: fromUser },
        { customer: toUser },
      ),
      BlStorage.UserMatches.updateMany(
        {
          customerA: fromUser,
        },
        { customerA: toUser },
      ),
      BlStorage.UserMatches.updateMany(
        {
          customerB: fromUser,
        },
        { customerB: toUser },
      ),
    ]);
  }
}
