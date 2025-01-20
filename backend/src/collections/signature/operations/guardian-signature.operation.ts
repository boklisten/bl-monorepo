import {
  deserializeBase64EncodedImage,
  isGuardianSignatureRequired,
  serializeSignature,
  signOrders,
} from "@backend/collections/signature/helpers/signature.helper.js";
import { Operation } from "@backend/operation/operation.js";
import { BlApiRequest } from "@backend/request/bl-api-request.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { SerializedGuardianSignature } from "@shared/signature/serialized-signature.js";
import { ObjectId } from "mongodb";

export class GuardianSignatureOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const serializedGuardianSignature = blApiRequest.data;
    if (!validateSerializedGuardianSignature(serializedGuardianSignature))
      throw new BlError("Bad serialized guardian signature").code(701);

    const userDetail = await BlStorage.UserDetails.get(
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

    const writtenSignature = await BlStorage.Signatures.add({
      // @ts-expect-error id will be auto-generated
      id: null,
      image: signatureImage,
      signedByGuardian: true,
      signingName: serializedGuardianSignature.signingName,
    });

    await BlStorage.UserDetails.update(userDetail.id, {
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
