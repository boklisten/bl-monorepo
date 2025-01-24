import { deserializeSignature, isUnderage, serializeSignature, signOrders, } from "@backend/lib/collections/signature/helpers/signature.helper.js";
import { Hook } from "@backend/lib/hook/hook.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class SignaturePostHook extends Hook {
    async before(body, accessToken) {
        const serializedSignature = body;
        if (!validateSerializedSignature(serializedSignature))
            throw new BlError("Bad serialized signature").code(701);
        const userDetail = await BlStorage.UserDetails.get(accessToken.details);
        if (serializedSignature.signedByGuardian != isUnderage(userDetail)) {
            throw new BlError("Signature signer does not match expected signer").code(812);
        }
        return await deserializeSignature(serializedSignature);
    }
    async after(docs, accessToken) {
        const [writtenSignature] = docs;
        if (!writtenSignature) {
            throw new BlError("This should be unreachable because the signature should be written").code(200);
        }
        const userDetail = await BlStorage.UserDetails.get(accessToken.details);
        await BlStorage.UserDetails.update(userDetail.id, {
            signatures: [...userDetail.signatures, writtenSignature.id],
        });
        await signOrders(userDetail);
        return [serializeSignature(writtenSignature)];
    }
}
function validateSerializedSignature(serializedSignature) {
    const s = serializedSignature;
    return (s != null &&
        typeof s.base64EncodedImage === "string" &&
        typeof s.signedByGuardian === "boolean" &&
        typeof s.signingName === "string");
}
