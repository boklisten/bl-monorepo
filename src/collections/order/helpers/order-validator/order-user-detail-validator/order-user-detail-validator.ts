import { BlError, Order, UserDetail } from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { userDetailSchema } from "@/collections/user-detail/user-detail.schema";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class OrderUserDetailValidator {
  private _userDetailStorage: BlDocumentStorage<UserDetail>;

  constructor(userDetailStorage?: BlDocumentStorage<UserDetail>) {
    this._userDetailStorage = userDetailStorage
      ? userDetailStorage
      : new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
  }

  public validate(order: Order): Promise<boolean> {
    return (
      this._userDetailStorage
        .get(order.customer)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .then((userDetail: UserDetail) => {
          /*
        if (!userDetail.emailConfirmed) {
          throw new BlError('userDetail.emailConfirmed is not true');
        }
        */

          return true;
        })
        .catch((userDetailValidateError: BlError) => {
          throw new BlError("userDetail could not be validated").add(
            userDetailValidateError,
          );
        })
    );
  }
}
