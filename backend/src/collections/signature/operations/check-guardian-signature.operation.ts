import { BlapiResponse, BlError, UserDetail } from "@boklisten/bl-model";
import { CheckGuardianSignatureSpec } from "@boklisten/bl-model/signature/serialized-signature";
import { ObjectId } from "mongodb";

import { BlCollectionName } from "@/collections/bl-collection";
import {
  getValidUserSignature,
  isGuardianSignatureRequired,
  isUnderage,
} from "@/collections/signature/helpers/signature.helper";
import {
  Signature,
  signatureSchema,
} from "@/collections/signature/signature.schema";
import { userDetailSchema } from "@/collections/user-detail/user-detail.schema";
import { Operation } from "@/operation/operation";
import { BlApiRequest } from "@/request/bl-api-request";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class CheckGuardianSignatureOperation implements Operation {
  private readonly _userDetailStorage: BlDocumentStorage<UserDetail>;
  private readonly _signatureStorage: BlDocumentStorage<Signature>;

  constructor(
    signatureStorage?: BlDocumentStorage<Signature>,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
  ) {
    this._signatureStorage =
      signatureStorage ??
      new BlDocumentStorage(BlCollectionName.Signatures, signatureSchema);
    this._userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
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
