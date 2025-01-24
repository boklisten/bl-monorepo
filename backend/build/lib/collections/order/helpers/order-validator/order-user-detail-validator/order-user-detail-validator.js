import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class OrderUserDetailValidator {
    validate(order) {
        return (BlStorage.UserDetails.get(order.customer)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .then((userDetail) => {
            /*
          if (!userDetail.emailConfirmed) {
            throw new BlError('userDetail.emailConfirmed is not true');
          }
          */
            return true;
        })
            .catch((userDetailValidateError) => {
            throw new BlError("userDetail could not be validated").add(userDetailValidateError);
        }));
    }
}
