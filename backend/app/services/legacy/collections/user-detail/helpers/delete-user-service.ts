import { SEDbQueryBuilder } from "#services/legacy/query/se.db-query-builder";
import { StorageService } from "#services/storage_service";

export class DeleteUserService {
  private queryBuilder = new SEDbQueryBuilder();

  public async deleteUser(userDetailId: string): Promise<void> {
    const databaseQuery = this.queryBuilder.getDbQuery(
      { userDetail: userDetailId },
      [{ fieldName: "userDetail", type: "object-id" }],
    );
    const users = await StorageService.Users.getByQuery(databaseQuery);
    for (const user of users) {
      await StorageService.Users.remove(user.id);
    }
  }

  async mergeIntoOtherUser(fromUser: string, toUser: string): Promise<void> {
    const [fromUserDetails, toUserDetails] = await Promise.all([
      StorageService.UserDetails.get(fromUser),
      StorageService.UserDetails.get(toUser),
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
      StorageService.UserDetails.update(toUser, {
        orders: newOrderRefs,
        customerItems: newCustomerItemRefs,
        signatures: newSignatureRefs,
      }),
      StorageService.CustomerItems.updateMany(
        { customer: fromUser },
        { customer: toUser },
      ),
      StorageService.Invoices.updateMany(
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
      StorageService.Orders.updateMany(
        {
          placed: true,
          customer: fromUser,
        },
        { customer: toUser },
      ),
      StorageService.Payments.updateMany(
        {
          customer: fromUser,
        },
        { customer: toUser },
      ),
      StorageService.StandMatches.updateMany(
        { customer: fromUser },
        { customer: toUser },
      ),
      StorageService.UserMatches.updateMany(
        {
          customerA: fromUser,
        },
        { customerA: toUser },
      ),
      StorageService.UserMatches.updateMany(
        {
          customerB: fromUser,
        },
        { customerB: toUser },
      ),
    ]);
  }
}
