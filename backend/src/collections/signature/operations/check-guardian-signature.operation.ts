import {
  getValidUserSignature,
  isGuardianSignatureRequired,
  isUnderage,
} from "@backend/collections/signature/helpers/signature.helper.js";
import { Operation } from "@backend/operation/operation.js";
import { BlApiRequest } from "@backend/request/bl-api-request.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { CheckGuardianSignatureSpec } from "@shared/signature/serialized-signature.js";
import { ObjectId } from "mongodb";

export class CheckGuardianSignatureOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const serializedGuardianSignature = blApiRequest.data;
    if (!validateSerializedGuardianSignature(serializedGuardianSignature))
      throw new BlError("Bad serialized guardian signature").code(701);

    const userDetail = await BlStorage.UserDetails.get(
      serializedGuardianSignature.customerId,
    );

    if (!isUnderage(userDetail)) {
      return new BlapiResponse([
        {
          message: `${userDetail.name} er myndig, og trenger derfor ikke signatur fra foreldre.`,
          guardianSignatureRequired: false,
        },
      ]);
    }

    if (!(await isGuardianSignatureRequired(userDetail))) {
      const signature = await getValidUserSignature(userDetail);
      return new BlapiResponse([
        {
          message: `${signature?.signingName} har allerede signert på vegne av ${userDetail.name}`,
          guardianSignatureRequired: false,
        },
      ]);
    }

    return new BlapiResponse([
      { customerName: userDetail.name, guardianSignatureRequired: true },
    ]);
  }
}

function validateSerializedGuardianSignature(
  serializedGuardianSignature: unknown,
): serializedGuardianSignature is CheckGuardianSignatureSpec {
  const s = serializedGuardianSignature as Partial<CheckGuardianSignatureSpec>;
  return (
    s != null &&
    typeof s.customerId === "string" &&
    ObjectId.isValid(s.customerId)
  );
}
