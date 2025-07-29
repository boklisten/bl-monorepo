import { UserDetailHelper } from "#services/legacy/collections/user-detail/helpers/user-detail.helper";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { BlError } from "#shared/bl-error";
import { BlapiResponse } from "#shared/blapi-response";

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
