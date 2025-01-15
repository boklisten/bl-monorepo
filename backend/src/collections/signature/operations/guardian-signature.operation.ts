import { OrderModel } from "@backend/collections/order/order.model";
import {
  deserializeBase64EncodedImage,
  isGuardianSignatureRequired,
  serializeSignature,
  signOrders,
} from "@backend/collections/signature/helpers/signature.helper";
import { SignatureModel } from "@backend/collections/signature/signature.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { SerializedGuardianSignature } from "@shared/signature/serialized-signature";
import { ObjectId } from "mongodb";

export class GuardianSignatureOperation implements Operation {
  private userDetailStorage = new BlStorage(UserDetailModel);
  private orderStorage = new BlStorage(OrderModel);
  private signatureStorage = new BlStorage(SignatureModel);

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const serializedGuardianSignature = blApiRequest.data;
    if (!validateSerializedGuardianSignature(serializedGuardianSignature))
      throw new BlError("Bad serialized guardian signature").code(701);

    const userDetail = await this.userDetailStorage.get(
      serializedGuardianSignature.customerId,
    );

    if (
      !(await isGuardianSignatureRequired(userDetail, this.signatureStorage))
    ) {
      throw new BlError(
        "Valid guardian signature is already present or not needed.",
      ).code(813);
    }

    const signatureImage = await deserializeBase64EncodedImage(
      serializedGuardianSignature.base64EncodedImage,
    );

    const writtenSignature = await this.signatureStorage.add({
      // @ts-expect-error id will be auto-generated
      id: null,
      image: signatureImage,
      signedByGuardian: true,
      signingName: serializedGuardianSignature.signingName,
    });

    await this.userDetailStorage.update(userDetail.id, {
      signatures: [...userDetail.signatures, writtenSignature.id],
    });

    await signOrders(this.orderStorage, userDetail);

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
