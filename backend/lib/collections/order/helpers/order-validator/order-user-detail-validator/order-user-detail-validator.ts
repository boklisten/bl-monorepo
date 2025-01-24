import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Order } from "@shared/order/order.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";

export class OrderUserDetailValidator {
  public validate(order: Order): Promise<boolean> {
    return (
      BlStorage.UserDetails.get(order.customer)
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
