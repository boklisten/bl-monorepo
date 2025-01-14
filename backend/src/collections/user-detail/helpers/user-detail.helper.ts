import { BlCollectionName } from "@backend/collections/bl-collection";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { isNullish } from "@backend/helper/typescript-helpers";
import { DibsEasyPayment } from "@backend/payment/dibs/dibs-easy-payment/dibs-easy-payment";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { UserDetail } from "@shared/user/user-detail/user-detail";

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
            .update(userDetailId, updateObject)
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

    if (
      (isNullish(userDetail.name) || userDetail.name.length <= 0) &&
      // @ts-expect-error fixme: auto ignored
      dibsUserDetail.firstName &&
      dibsUserDetail?.lastName
    ) {
      // @ts-expect-error fixme: auto ignored
      userDetailUpdateObject["name"] =
        dibsUserDetail.firstName + " " + dibsUserDetail.lastName;
    }

    if (
      (isNullish(userDetail.phone) || userDetail.phone.length <= 0) &&
      dibsUserDetail?.phoneNumber.number
    ) {
      // @ts-expect-error fixme: auto ignored
      userDetailUpdateObject["phone"] = dibsUserDetail.phoneNumber.number;
    }

    if (
      (isNullish(userDetail.address) || userDetail.address.length <= 0) &&
      // @ts-expect-error fixme: auto ignored
      dibsShippingAddress.addressLine1
    ) {
      // @ts-expect-error fixme: auto ignored
      userDetailUpdateObject["address"] =
        // @ts-expect-error fixme: auto ignored
        dibsShippingAddress.addressLine1 +
        " " +
        // @ts-expect-error fixme: auto ignored
        dibsShippingAddress.addressLine2;
    }

    if (
      (isNullish(userDetail.postCity) || userDetail.postCity.length <= 0) &&
      // @ts-expect-error fixme: auto ignored
      dibsShippingAddress.city
    ) {
      // @ts-expect-error fixme: auto ignored
      userDetailUpdateObject["postCity"] = dibsShippingAddress.city;
    }

    if (
      (isNullish(userDetail.postCode) || userDetail.postCode.length <= 0) &&
      // @ts-expect-error fixme: auto ignored
      dibsShippingAddress.postalCode
    ) {
      // @ts-expect-error fixme: auto ignored
      userDetailUpdateObject["postCode"] = dibsShippingAddress.postalCode;
    }

    return userDetailUpdateObject;
  }

  public isValid(userDetail: UserDetail): boolean {
    const invalidUserDetailFields = this.getInvalidUserDetailFields(userDetail);

    // @ts-expect-error fixme: auto ignored
    return invalidUserDetailFields.length <= 0 && userDetail.active;
  }

  public getFirstName(name: string) {
    const splitName = name.trimEnd().split(" ");
    return splitName.length <= 1
      ? name.trim()
      : splitName.slice(0, -1).join(" ").trim();
  }

  public getLastName(name: string) {
    const splitName = name.trimEnd().split(" ");
    return splitName.length <= 1 ? "" : splitName.slice(-1).join(" ");
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
