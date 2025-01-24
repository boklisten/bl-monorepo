import { getValidUserSignature, isGuardianSignatureRequired, isUnderage, } from "@backend/lib/collections/signature/helpers/signature.helper.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { ObjectId } from "mongodb";
export class CheckGuardianSignatureOperation {
    async run(blApiRequest) {
        const serializedGuardianSignature = blApiRequest.data;
        if (!validateSerializedGuardianSignature(serializedGuardianSignature))
            throw new BlError("Bad serialized guardian signature").code(701);
        const userDetail = await BlStorage.UserDetails.get(serializedGuardianSignature.customerId);
        if (!isUnderage(userDetail)) {
            return new BlapiResponse([
                {
                    message: `${userDetail.name} er myndig, og trenger derfor ikke signatur fra foreldre.`,
                    guardianSignatureRequired: false,
                },
            ]);
        }
        if (!(await isGuardianSignatureRequired(userDetail))) {
            const signature = await getValidUserSignature(userDetail);
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
function validateSerializedGuardianSignature(serializedGuardianSignature) {
    const s = serializedGuardianSignature;
    return (s != null &&
        typeof s.customerId === "string" &&
        ObjectId.isValid(s.customerId));
}
