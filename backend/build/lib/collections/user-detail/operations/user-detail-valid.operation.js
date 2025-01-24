import { UserDetailHelper } from "@backend/lib/collections/user-detail/helpers/user-detail.helper.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
export class UserDetailValidOperation {
    userDetailHelper = new UserDetailHelper();
    async run(blApiRequest) {
        try {
            const userDetail = await BlStorage.UserDetails.get(blApiRequest.documentId);
            const invalidUserDetailFields = this.userDetailHelper.getInvalidUserDetailFields(userDetail);
            if (invalidUserDetailFields.length <= 0) {
                return new BlapiResponse([{ valid: true }]);
            }
            return new BlapiResponse([
                { valid: false, invalidFields: invalidUserDetailFields },
            ]);
        }
        catch (error) {
            const responseError = new BlError("userDetail could not be validated");
            if (error instanceof BlError) {
                responseError.add(error);
            }
            throw responseError;
        }
    }
}
