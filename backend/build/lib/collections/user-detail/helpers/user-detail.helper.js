import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class UserDetailHelper {
    updateUserDetailBasedOnDibsEasyPayment(userDetailId, dibsEasyPayment) {
        return new Promise((resolve, reject) => {
            BlStorage.UserDetails.get(userDetailId)
                .then((userDetail) => {
                const updateObject = this.getUserDetailUpdateObject(dibsEasyPayment, userDetail);
                BlStorage.UserDetails.update(userDetailId, updateObject)
                    .then((updatedUserDetail) => {
                    resolve(updatedUserDetail);
                })
                    .catch((updateUserDetailError) => {
                    reject(new BlError(`could not update userDetail "${userDetailId}" with user details from dibsPayment`).add(updateUserDetailError));
                });
            })
                .catch((getUserDetailError) => {
                reject(new BlError(`could not get userDetail "${userDetailId}"`).add(getUserDetailError));
            });
        });
    }
    getUserDetailUpdateObject(dibsEasyPayment, userDetail) {
        const dibsUserDetail = dibsEasyPayment.consumer.privatePerson;
        const dibsShippingAddress = dibsEasyPayment.consumer.shippingAddress;
        const userDetailUpdateObject = {};
        if ((isNullish(userDetail.name) || userDetail.name.length <= 0) &&
            // @ts-expect-error fixme: auto ignored
            dibsUserDetail.firstName &&
            dibsUserDetail?.lastName) {
            // @ts-expect-error fixme: auto ignored
            userDetailUpdateObject["name"] =
                dibsUserDetail.firstName + " " + dibsUserDetail.lastName;
        }
        if ((isNullish(userDetail.phone) || userDetail.phone.length <= 0) &&
            dibsUserDetail?.phoneNumber.number) {
            // @ts-expect-error fixme: auto ignored
            userDetailUpdateObject["phone"] = dibsUserDetail.phoneNumber.number;
        }
        if ((isNullish(userDetail.address) || userDetail.address.length <= 0) &&
            // @ts-expect-error fixme: auto ignored
            dibsShippingAddress.addressLine1) {
            // @ts-expect-error fixme: auto ignored
            userDetailUpdateObject["address"] =
                // @ts-expect-error fixme: auto ignored
                dibsShippingAddress.addressLine1 +
                    " " +
                    // @ts-expect-error fixme: auto ignored
                    dibsShippingAddress.addressLine2;
        }
        if ((isNullish(userDetail.postCity) || userDetail.postCity.length <= 0) &&
            // @ts-expect-error fixme: auto ignored
            dibsShippingAddress.city) {
            // @ts-expect-error fixme: auto ignored
            userDetailUpdateObject["postCity"] = dibsShippingAddress.city;
        }
        if ((isNullish(userDetail.postCode) || userDetail.postCode.length <= 0) &&
            // @ts-expect-error fixme: auto ignored
            dibsShippingAddress.postalCode) {
            // @ts-expect-error fixme: auto ignored
            userDetailUpdateObject["postCode"] = dibsShippingAddress.postalCode;
        }
        return userDetailUpdateObject;
    }
    isValid(userDetail) {
        const invalidUserDetailFields = this.getInvalidUserDetailFields(userDetail);
        // @ts-expect-error fixme: auto ignored
        return invalidUserDetailFields.length <= 0 && userDetail.active;
    }
    getFirstName(name) {
        const splitName = name.trimEnd().split(" ");
        return splitName.length <= 1
            ? name.trim()
            : splitName.slice(0, -1).join(" ").trim();
    }
    getLastName(name) {
        const splitName = name.trimEnd().split(" ");
        return splitName.length <= 1 ? "" : splitName.slice(-1).join(" ");
    }
    getInvalidUserDetailFields(userDetail) {
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
