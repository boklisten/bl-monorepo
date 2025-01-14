import {
  getValidUserSignature,
  isGuardianSignatureRequired,
  isUnderage,
} from "@backend/collections/signature/helpers/signature.helper";
import { SignatureModel } from "@backend/collections/signature/signature.model";
import { Signature } from "@backend/collections/signature/signature.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { CheckGuardianSignatureSpec } from "@shared/signature/serialized-signature";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { ObjectId } from "mongodb";

export class CheckGuardianSignatureOperation implements Operation {
  private readonly _userDetailStorage: BlDocumentStorage<UserDetail>;
  private readonly _signatureStorage: BlDocumentStorage<Signature>;

  constructor(
    signatureStorage?: BlDocumentStorage<Signature>,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
  ) {
    this._signatureStorage =
      signatureStorage ?? new BlDocumentStorage(SignatureModel);
    this._userDetailStorage =
      userDetailStorage ?? new BlDocumentStorage(UserDetailModel);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const serializedGuardianSignature = blApiRequest.data;
    if (!validateSerializedGuardianSignature(serializedGuardianSignature))
      throw new BlError("Bad serialized guardian signature").code(701);

    const userDetail = await this._userDetailStorage.get(
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
      !(await isGuardianSignatureRequired(userDetail, this._signatureStorage))
    ) {
      const signature = await getValidUserSignature(
        userDetail,
        this._signatureStorage,
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
