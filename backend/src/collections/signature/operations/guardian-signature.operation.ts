import { SystemUser } from "@backend/auth/permission/permission.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { orderSchema } from "@backend/collections/order/order.schema";
import {
  deserializeBase64EncodedImage,
  isGuardianSignatureRequired,
  serializeSignature,
  signOrders,
} from "@backend/collections/signature/helpers/signature.helper";
import {
  Signature,
  signatureSchema,
} from "@backend/collections/signature/signature.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Order } from "@shared/order/order";
import { SerializedGuardianSignature } from "@shared/signature/serialized-signature";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { ObjectId } from "mongodb";

export class GuardianSignatureOperation implements Operation {
  private readonly _userDetailStorage: BlDocumentStorage<UserDetail>;
  private readonly _orderStorage: BlDocumentStorage<Order>;
  private readonly _signatureStorage: BlDocumentStorage<Signature>;

  constructor(
    signatureStorage?: BlDocumentStorage<Signature>,
    orderStorage?: BlDocumentStorage<Order>,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
  ) {
    this._signatureStorage =
      signatureStorage ??
      new BlDocumentStorage(BlCollectionName.Signatures, signatureSchema);
    this._orderStorage =
      orderStorage ??
      new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
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

    if (
      !(await isGuardianSignatureRequired(userDetail, this._signatureStorage))
    ) {
      throw new BlError(
        "Valid guardian signature is already present or not needed.",
      ).code(813);
    }

    const signatureImage = await deserializeBase64EncodedImage(
      serializedGuardianSignature.base64EncodedImage,
    );

    const writtenSignature = await this._signatureStorage.add(
      {
        // @ts-expect-error id will be auto-generated
        id: null,
        image: signatureImage,
        signedByGuardian: true,
        signingName: serializedGuardianSignature.signingName,
      },
      new SystemUser(),
    );

    await this._userDetailStorage.update(
      userDetail.id,
      { signatures: [...userDetail.signatures, writtenSignature.id] },
      new SystemUser(),
    );

    await signOrders(this._orderStorage, userDetail);

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
