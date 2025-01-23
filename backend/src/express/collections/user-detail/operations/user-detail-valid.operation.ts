import { UserDetailHelper } from "@backend/express/collections/user-detail/helpers/user-detail.helper.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";

export class UserDetailValidOperation implements Operation {
  private userDetailHelper = new UserDetailHelper();

  async run(blApiRequest: BlApiRequest) {
    try {
      const userDetail = await BlStorage.UserDetails.get(
        blApiRequest.documentId,
      );

      const invalidUserDetailFields =
        this.userDetailHelper.getInvalidUserDetailFields(userDetail);

      if (invalidUserDetailFields.length <= 0) {
        return new BlapiResponse([{ valid: true }]);
      }

      return new BlapiResponse([
        { valid: false, invalidFields: invalidUserDetailFields },
      ]);
    } catch (error) {
      const responseError: BlError = new BlError(
        "userDetail could not be validated",
      );

      if (error instanceof BlError) {
        responseError.add(error);
      }

      throw responseError;
    }
  }
}
