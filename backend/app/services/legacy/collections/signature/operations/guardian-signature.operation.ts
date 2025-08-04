import { ObjectId } from "mongodb";

import {
  deserializeBase64EncodedImage,
  isGuardianSignatureRequired,
  serializeSignature,
  signOrders,
} from "#services/legacy/collections/signature/helpers/signature.helper";
import { StorageService } from "#services/storage_service";
import { BlError } from "#shared/bl-error";
import { BlapiResponse } from "#shared/blapi-response";
import { SerializedGuardianSignature } from "#shared/serialized-signature";
import { BlApiRequest } from "#types/bl-api-request";
import { Operation } from "#types/operation";

export class GuardianSignatureOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const serializedGuardianSignature = blApiRequest.data;
    if (!validateSerializedGuardianSignature(serializedGuardianSignature))
      throw new BlError("Bad serialized guardian signature").code(701);

    const userDetail = await StorageService.UserDetails.get(
      serializedGuardianSignature.customerId,
    );

    if (!(await isGuardianSignatureRequired(userDetail))) {
      throw new BlError(
        "Valid guardian signature is already present or not needed.",
      ).code(813);
    }

    const signatureImage = await deserializeBase64EncodedImage(
      serializedGuardianSignature.base64EncodedImage,
    );

    const writtenSignature = await StorageService.Signatures.add({
      // @ts-expect-error id will be auto-generated
      id: null,
      image: signatureImage,
      signedByGuardian: true,
      signingName: serializedGuardianSignature.signingName,
    });

    await StorageService.UserDetails.update(userDetail.id, {
      signatures: [...userDetail.signatures, writtenSignature.id],
    });

    await signOrders(userDetail);

    return new BlapiResponse([serializeSignature(writtenSignature)]);
  }
}

function validateSerializedGuardianSignature(
  serializedGuardianSignature: unknown,
): serializedGuardianSignature is SerializedGuardianSignature {
  const s = serializedGuardianSignature as Partial<SerializedGuardianSignature>;
  return (
    s != null &&
    typeof s.customerId === "string" &&
    ObjectId.isValid(s.customerId) &&
    typeof s.base64EncodedImage === "string" &&
    typeof s.signingName === "string"
  );
}
