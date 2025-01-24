import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";

export class EmailValidationConfirmOperation implements Operation {
  async run(blApiRequest: BlApiRequest) {
    if (isNullish(blApiRequest.documentId)) {
      throw new BlError("no documentId provided");
    }

    const emailValidation = await BlStorage.EmailValidations.get(
      blApiRequest.documentId,
    );
    await BlStorage.UserDetails.update(emailValidation.userDetail, {
      emailConfirmed: true,
    });
    return new BlapiResponse([{ confirmed: true }]);
  }
}
