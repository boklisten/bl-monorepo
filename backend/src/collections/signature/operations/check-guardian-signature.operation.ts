import {
  getValidUserSignature,
  isGuardianSignatureRequired,
  isUnderage,
} from "@backend/collections/signature/helpers/signature.helper";
import { SignatureModel } from "@backend/collections/signature/signature.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { CheckGuardianSignatureSpec } from "@shared/signature/serialized-signature";
import { ObjectId } from "mongodb";

export class CheckGuardianSignatureOperation implements Operation {
  private userDetailStorage = new BlStorage(UserDetailModel);
  private signatureStorage = new BlStorage(SignatureModel);

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const serializedGuardianSignature = blApiRequest.data;
    if (!validateSerializedGuardianSignature(serializedGuardianSignature))
      throw new BlError("Bad serialized guardian signature").code(701);

    const userDetail = await this.userDetailStorage.get(
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

    if (
      !(await isGuardianSignatureRequired(userDetail, this.signatureStorage))
    ) {
      const signature = await getValidUserSignature(
        userDetail,
        this.signatureStorage,
      );
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
