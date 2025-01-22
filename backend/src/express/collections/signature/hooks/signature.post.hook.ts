import {
  deserializeSignature,
  isUnderage,
  serializeSignature,
  signOrders,
} from "@backend/express/collections/signature/helpers/signature.helper.js";
import { Hook } from "@backend/express/hook/hook.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { Signature } from "@backend/express/storage/models/signature.model.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { SerializedSignature } from "@shared/signature/serialized-signature.js";
import { AccessToken } from "@shared/token/access-token.js";

export class SignaturePostHook extends Hook {
  override async before(
    body: unknown,
    accessToken: AccessToken,
  ): Promise<Signature> {
    const serializedSignature = body;
    if (!validateSerializedSignature(serializedSignature))
      throw new BlError("Bad serialized signature").code(701);

    const userDetail = await BlStorage.UserDetails.get(accessToken.details);
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
    const userDetail = await BlStorage.UserDetails.get(accessToken.details);
    await BlStorage.UserDetails.update(userDetail.id, {
      signatures: [...userDetail.signatures, writtenSignature.id],
    });

    await signOrders(userDetail);

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
