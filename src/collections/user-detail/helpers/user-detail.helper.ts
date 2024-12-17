import { AccessToken, BlError, UserDetail } from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { userDetailSchema } from "@/collections/user-detail/user-detail.schema";
import { isNullish } from "@/helper/typescript-helpers";
import { DibsEasyPayment } from "@/payment/dibs/dibs-easy-payment/dibs-easy-payment";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class UserDetailHelper {
  private _userDetailStorage: BlDocumentStorage<UserDetail>;

  constructor(userDetailStorage?: BlDocumentStorage<UserDetail>) {
    this._userDetailStorage = userDetailStorage
      ? userDetailStorage
      : new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
  }

  public updateUserDetailBasedOnDibsEasyPayment(
    userDetailId: string,
    dibsEasyPayment: DibsEasyPayment,
    accessToken: AccessToken,
  ): Promise<UserDetail> {
    return new Promise((resolve, reject) => {
      this._userDetailStorage
        .get(userDetailId)
        .then((userDetail: UserDetail) => {
          const updateObject = this.getUserDetailUpdateObject(
            dibsEasyPayment,
            userDetail,
          );

          this._userDetailStorage
            .update(userDetailId, updateObject, {
              id: accessToken.sub,
              permission: accessToken.permission,
            })
            .then((updatedUserDetail: UserDetail) => {
              resolve(updatedUserDetail);
            })
            .catch((updateUserDetailError: BlError) => {
              reject(
                new BlError(
                  `could not update userDetail "${userDetailId}" with user details from dibsPayment`,
                ).add(updateUserDetailError),
              );
            });
        })
        .catch((getUserDetailError: BlError) => {
          reject(
            new BlError(`could not get userDetail "${userDetailId}"`).add(
              getUserDetailError,
            ),
          );
        });
    });
  }

  private getUserDetailUpdateObject(
    dibsEasyPayment: DibsEasyPayment,
    userDetail: UserDetail,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    const dibsUserDetail = dibsEasyPayment.consumer.privatePerson;
    const dibsShippingAddress = dibsEasyPayment.consumer.shippingAddress;

    const userDetailUpdateObject = {};

    if (isNullish(userDetail.name) || userDetail.name.length <= 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (dibsUserDetail.firstName && dibsUserDetail.lastName) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        userDetailUpdateObject["name"] = // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          dibsUserDetail.firstName + " " + dibsUserDetail.lastName;
      }
    }

    if (isNullish(userDetail.phone) || userDetail.phone.length <= 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (dibsUserDetail.phoneNumber && dibsUserDetail.phoneNumber.number) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        userDetailUpdateObject["phone"] = dibsUserDetail.phoneNumber.number;
      }
    }

    if (isNullish(userDetail.address) || userDetail.address.length <= 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (dibsShippingAddress.addressLine1) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        userDetailUpdateObject["address"] =
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          dibsShippingAddress.addressLine1 +
          " " +
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          dibsShippingAddress.addressLine2;
      }
    }

    if (isNullish(userDetail.postCity) || userDetail.postCity.length <= 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (dibsShippingAddress.city) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        userDetailUpdateObject["postCity"] = dibsShippingAddress.city;
      }
    }

    if (isNullish(userDetail.postCode) || userDetail.postCode.length <= 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (dibsShippingAddress.postalCode) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        userDetailUpdateObject["postCode"] = dibsShippingAddress.postalCode;
      }
    }

    return userDetailUpdateObject;
  }

  public isValid(userDetail: UserDetail): boolean {
    const invalidUserDetailFields = this.getInvalidUserDetailFields(userDetail);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return invalidUserDetailFields.length <= 0 && userDetail.active;
  }

  public getFirstName(name: string) {
    const splitName = name.trimEnd().split(" ");
    if (splitName.length <= 1) {
      return name.trim();
    } else {
      return splitName.slice(0, -1).join(" ").trim();
    }
  }

  public getLastName(name: string) {
    const splitName = name.trimEnd().split(" ");
    if (splitName.length <= 1) {
      return "";
    } else {
      return splitName.slice(-1).join(" ");
    }
  }

  public getInvalidUserDetailFields(userDetail: UserDetail) {
    const invalidFields = [];

    if (isNullish(userDetail.name) || userDetail.name.length <= 0) {
      invalidFields.push("name");
    }

    if (isNullish(userDetail.address) || userDetail.address.length <= 0) {
      invalidFields.push("address");
    }

    if (isNullish(userDetail.postCode) || userDetail.postCode.length <= 0) {
      invalidFields.push("postCode");
    }

    if (isNullish(userDetail.postCity) || userDetail.postCity.length <= 0) {
      invalidFields.push("postCity");
    }

    if (isNullish(userDetail.phone) || userDetail.phone.length <= 0) {
      invalidFields.push("phone");
    }
    /*
    if (
      isNullish(userDetail.emailConfirmed) ||
      !userDetail.emailConfirmed
    ) {
      invalidFields.push('emailConfirmed');
    }
    */

    if (isNullish(userDetail.dob)) {
      invalidFields.push("dob");
    }

    return invalidFields;
  }
}
