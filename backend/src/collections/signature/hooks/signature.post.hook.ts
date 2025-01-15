import { OrderModel } from "@backend/collections/order/order.model";
import {
  deserializeSignature,
  isUnderage,
  serializeSignature,
  signOrders,
} from "@backend/collections/signature/helpers/signature.helper";
import { Signature } from "@backend/collections/signature/signature.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { Hook } from "@backend/hook/hook";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { SerializedSignature } from "@shared/signature/serialized-signature";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class SignaturePostHook extends Hook {
  private userDetailStorage: BlStorage<UserDetail>;
  private orderStorage: BlStorage<Order>;

  constructor(
    userDetailStorage?: BlStorage<UserDetail>,
    orderStorage?: BlStorage<Order>,
  ) {
    super();
    this.userDetailStorage =
      userDetailStorage ?? new BlStorage(UserDetailModel);
    this.orderStorage = orderStorage ?? new BlStorage(OrderModel);
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
    await this.userDetailStorage.update(userDetail.id, {
      signatures: [...userDetail.signatures, writtenSignature.id],
    });

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
