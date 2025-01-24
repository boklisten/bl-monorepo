import { serializeSignature } from "@backend/lib/collections/signature/helpers/signature.helper.js";
import { Hook } from "@backend/lib/hook/hook.js";
import { Signature } from "@backend/lib/storage/models/signature.model.js";
import { SerializedSignature } from "@shared/signature/serialized-signature.js";

export class SignatureGetIdHook extends Hook {
  public override async after(
    docs: Signature[],
  ): Promise<SerializedSignature[]> {
    return docs.map((signature) => serializeSignature(signature));
  }
}
