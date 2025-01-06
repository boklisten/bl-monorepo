import { BlCollectionName } from "@backend/collections/bl-collection";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { invoiceSchema } from "@backend/collections/invoice/invoice.schema";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { localLoginSchema } from "@backend/collections/local-login/local-login.schema";
import { orderSchema } from "@backend/collections/order/order.schema";
import { paymentSchema } from "@backend/collections/payment/payment.schema";
import { User } from "@backend/collections/user/user";
import { UserSchema } from "@backend/collections/user/user.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Invoice } from "@shared/invoice/invoice";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class DeleteUserService {
  private queryBuilder: SEDbQueryBuilder;
  private userStorage: BlDocumentStorage<User>;
  private userDetailStorage: BlDocumentStorage<UserDetail>;
  private localLoginStorage: BlDocumentStorage<LocalLogin>;
  private customerItemStorage: BlDocumentStorage<CustomerItem>;
  private invoiceStorage: BlDocumentStorage<Invoice>;
  private orderStorage: BlDocumentStorage<Order>;
  private paymentStorage: BlDocumentStorage<Payment>;

  constructor(
    _userStorage?: BlDocumentStorage<User>,
    _userDetailStorage?: BlDocumentStorage<UserDetail>,
    _localLoginStorage?: BlDocumentStorage<LocalLogin>,
    _customerItemStorage?: BlDocumentStorage<CustomerItem>,
    _invoiceStorage?: BlDocumentStorage<Invoice>,
    _orderStorage?: BlDocumentStorage<Order>,
    _paymentStorage?: BlDocumentStorage<Payment>,
  ) {
    this.userStorage =
      _userStorage ?? new BlDocumentStorage(BlCollectionName.Users, UserSchema);
    this.userDetailStorage =
      _userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
    this.localLoginStorage =
      _localLoginStorage ??
      new BlDocumentStorage(BlCollectionName.LocalLogins, localLoginSchema);
    this.customerItemStorage =
      _customerItemStorage ??
      new BlDocumentStorage(BlCollectionName.CustomerItems, customerItemSchema);
    this.invoiceStorage =
      _invoiceStorage ??
      new BlDocumentStorage(BlCollectionName.Invoices, invoiceSchema);
    this.orderStorage =
      _orderStorage ??
      new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this.paymentStorage =
      _paymentStorage ??
      new BlDocumentStorage(BlCollectionName.Payments, paymentSchema);

    this.queryBuilder = new SEDbQueryBuilder();
  }

  public async deleteUser(
    userDetailId: string,
    accessToken: AccessToken,
  ): Promise<void> {
    const databaseQuery = this.queryBuilder.getDbQuery(
      { userDetail: userDetailId },
      [{ fieldName: "userDetail", type: "object-id" }],
    );
    const users = await this.userStorage.getByQuery(databaseQuery);
    for (const user of users) {
      await this.userStorage.remove(user.id, {
        id: accessToken.details,
        permission: accessToken.permission,
      });
      await this.removeLocalLogin(user.username, accessToken);
    }
  }

  private async removeLocalLogin(
    username: string,
    accessToken: AccessToken,
  ): Promise<void> {
    const localLoginDatabaseQuery = this.queryBuilder.getDbQuery(
      { username: username },
      [{ fieldName: "username", type: "string" }],
    );
    const localLogins = await this.localLoginStorage.getByQuery(
      localLoginDatabaseQuery,
    );
    for (const localLogin of localLogins) {
      await this.localLoginStorage.remove(localLogin.id, {
        id: accessToken.details,
        permission: accessToken.permission,
      });
    }
  }

  // TODO: also merge matches to new user
  async mergeIntoOtherUser(
    fromUser: string,
    toUser: string,
    accessToken: AccessToken,
  ): Promise<void> {
    const [fromUserDetails, toUserDetails] = await Promise.all([
      this.userDetailStorage.get(fromUser),
      this.userDetailStorage.get(toUser),
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
      this.userDetailStorage.update(
        toUser,
        {
          orders: newOrderRefs,
          customerItems: newCustomerItemRefs,
          signatures: newSignatureRefs,
        },
        {
          id: accessToken.details,
          permission: accessToken.permission,
        },
      ),
      this.customerItemStorage.updateMany(
        { customer: fromUser },
        { customer: toUser },
      ),
      this.invoiceStorage.updateMany(
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
      this.orderStorage.updateMany(
        {
          placed: true,
          customer: fromUser,
        },
        { customer: toUser },
      ),
      this.paymentStorage.updateMany(
        {
          customer: fromUser,
        },
        { customer: toUser },
      ),
    ]);
  }
}
