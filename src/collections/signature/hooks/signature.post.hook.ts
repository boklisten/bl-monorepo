import {
  AccessToken,
  BlError,
  Order,
  SerializedSignature,
  UserDetail,
} from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { orderSchema } from "@/collections/order/order.schema";
import {
  deserializeSignature,
  isUnderage,
  serializeSignature,
  signOrders,
} from "@/collections/signature/helpers/signature.helper";
import { Signature } from "@/collections/signature/signature.schema";
import { userDetailSchema } from "@/collections/user-detail/user-detail.schema";
import { Hook } from "@/hook/hook";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class SignaturePostHook extends Hook {
  private userDetailStorage: BlDocumentStorage<UserDetail>;
  private orderStorage: BlDocumentStorage<Order>;

  constructor(
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    orderStorage?: BlDocumentStorage<Order>,
  ) {
    super();
    this.userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage<UserDetail>(
        BlCollectionName.UserDetails,
        userDetailSchema,
      );
    this.orderStorage =
      orderStorage ??
      new BlDocumentStorage<Order>(BlCollectionName.Orders, orderSchema);
  }

  override async before(
    body: unknown,
    accessToken: AccessToken,
  ): Promise<Signature> {
    const serializedSignature = body;
    if (!validateSerializedSignature(serializedSignature))
      throw new BlError("Bad serialized signature").code(701);

    const userDetail = await this.userDetailStorage.get(accessToken.details);
    if (serializedSignature.signedByGuardian != isUnderage(userDetail)) {
      throw new BlError("Signature signer does not match expected signer").code(
        812,
      );
    }

    return await deserializeSignature(serializedSignature);
  }

  override async after(
    docs: Signature[],
    accessToken: AccessToken,
  ): Promise<[SerializedSignature]> {
    const [writtenSignature] = docs;
    if (!writtenSignature) {
      throw new BlError(
        "This should be unreachable because the signature should be written",
      ).code(200);
    }
    const userDetail = await this.userDetailStorage.get(accessToken.details);
    await this.userDetailStorage.update(
      userDetail.id,
      { signatures: [...userDetail.signatures, writtenSignature.id] },
      { id: accessToken.details, permission: accessToken.permission },
    );

    await signOrders(this.orderStorage, userDetail);

    return [serializeSignature(writtenSignature)];
  }
}

function validateSerializedSignature(
  serializedSignature: unknown,
): serializedSignature is SerializedSignature {
  const s = serializedSignature as Partial<SerializedSignature>;
  return (
    s != null &&
    typeof s.base64EncodedImage === "string" &&
    typeof s.signedByGuardian === "boolean" &&
    typeof s.signingName === "string"
  );
}
