import { Signature } from "@backend/collections/signature/signature.model";
import { logger } from "@backend/logger/logger";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { Transformer } from "@napi-rs/image";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import {
  SerializedSignature,
  SIGNATURE_NUM_MONTHS_VALID,
  SignatureMetadata,
} from "@shared/signature/serialized-signature";
import { UserDetail } from "@shared/user/user-detail/user-detail";

const qualityFactor = 10;

export function serializeSignature(signature: Signature): SerializedSignature {
  const { image, ...rest } = signature;
  return {
    base64EncodedImage: image.toString("base64"),
    ...rest,
  };
}
export async function deserializeBase64EncodedImage(
  base64EncodedImage: string,
) {
  if (!isValidBase64(base64EncodedImage)) {
    throw new BlError("Invalid base64").code(701);
  }
  return await new Transformer(Buffer.from(base64EncodedImage, "base64"))
    .webp(qualityFactor)
    .catch((error) => {
      throw new BlError(`Unable to transform to WebP`).code(701).add(error);
    });
}

export async function deserializeSignature(
  serializedSignature: SerializedSignature,
): Promise<Signature> {
  const { base64EncodedImage, ...rest } = serializedSignature;
  const image = await deserializeBase64EncodedImage(base64EncodedImage);

  return { image, ...rest };
}

export async function getValidUserSignature(
  userDetail: UserDetail,
  signatureStorage: BlDocumentStorage<Signature>,
): Promise<Signature | null> {
  const newestSignatureId = userDetail.signatures.at(-1);
  if (newestSignatureId == undefined) return null;

  const signature = await signatureStorage.get(newestSignatureId);
  if (!signatureIsValidForUser(userDetail, signature)) {
    return null;
  }

  return signature;
}

export async function userHasValidSignature(
  userDetail: UserDetail,
  signatureStorage: BlDocumentStorage<Signature>,
): Promise<boolean> {
  return (await getValidUserSignature(userDetail, signatureStorage)) != null;
}

export function signatureIsValidForUser(
  userDetail: UserDetail,
  signature: SignatureMetadata,
): boolean {
  if (isSignatureExpired(signature)) {
    return false;
  }

  return isUnderage(userDetail) === signature.signedByGuardian;
}

export function isUnderage(userDetail: UserDetail): boolean {
  const now = new Date();
  const latestAdultBirthDate = new Date(
    now.getFullYear() - 18,
    now.getMonth(),
    now.getDate(),
  );
  return userDetail.dob > latestAdultBirthDate;
}

export function isSignatureExpired(signature: SignatureMetadata): boolean {
  const now = new Date();
  const oldestAllowedSignatureTime = new Date(
    now.getFullYear(),
    now.getMonth() - SIGNATURE_NUM_MONTHS_VALID,
    now.getDate(),
  );

  return signature.creationTime < oldestAllowedSignatureTime;
}

// NodeJS will by default ignore non-base64 characters, which can lead to issues
function isValidBase64(input: string): boolean {
  return Buffer.from(input, "base64").toString("base64") === input;
}

export async function signOrders(
  orderStorage: BlDocumentStorage<Order>,
  userDetail: UserDetail,
) {
  if (!(userDetail.orders && userDetail.orders.length > 0)) {
    return;
  }
  const orders = await orderStorage.getMany(userDetail.orders);
  await Promise.all(
    orders
      .filter((order) => order.pendingSignature)
      .map(async (order) => {
        return await orderStorage
          .update(order.id, { pendingSignature: false })
          .catch((error) =>
            logger.error(
              `While processing new signature, unable to update order ${order.id}: ${error}`,
            ),
          );
      }),
  );
}

export async function isGuardianSignatureRequired(
  userDetail: UserDetail,
  signatureStorage: BlDocumentStorage<Signature>,
) {
  if (!isUnderage(userDetail)) {
    return false;
  }

  const latestValidSignature = await getValidUserSignature(
    userDetail,
    signatureStorage,
  );
  return (
    latestValidSignature === null || !latestValidSignature.signedByGuardian
  );
}
