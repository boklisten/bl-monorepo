import { ObjectId } from "mongodb";

import {
  getValidUserSignature,
  isGuardianSignatureRequired,
  isUnderage,
} from "#services/legacy/collections/signature/helpers/signature.helper";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error";
import { BlapiResponse } from "#shared/blapi-response";
import { CheckGuardianSignatureSpec } from "#shared/serialized-signature";
import { BlApiRequest } from "#types/bl-api-request";
import { Operation } from "#types/operation";

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
