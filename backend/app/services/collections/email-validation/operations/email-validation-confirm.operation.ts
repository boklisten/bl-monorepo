import { isNullish } from "#services/helper/typescript-helpers";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";

export class EmailValidationConfirmOperation implements Operation {
  async run(blApiRequest: BlApiRequest) {
    if (isNullish(blApiRequest.documentId)) {
      throw new BlError("no documentId provided");
    }

    try {
      const emailValidation = await BlStorage.EmailValidations.get(
        blApiRequest.documentId,
      );
      await BlStorage.UserDetails.update(emailValidation.userDetail, {
        emailConfirmed: true,
      });
      return new BlapiResponse([{ confirmed: true }]);
    } catch {
      return new BlapiResponse([{ confirmed: false }]);
    }
  }
}
