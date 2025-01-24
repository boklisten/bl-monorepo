import { serializeSignature } from "@backend/lib/collections/signature/helpers/signature.helper.js";
import { Hook } from "@backend/lib/hook/hook.js";
export class SignatureGetIdHook extends Hook {
    async after(docs) {
        return docs.map((signature) => serializeSignature(signature));
    }
}
